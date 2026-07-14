import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import Loan from '../models/Loan.js';
import { supabase } from '../config/supabase.js';

// Helper to adjust account balance based on transaction type and operation (apply/revert)
const adjustBalances = async (transaction, operation) => {
  if (!transaction) return;
  
  const amount = Number(transaction.amount);
  if (isNaN(amount) || amount <= 0) return;

  // 1. Adjust Account Balances
  if (transaction.type === 'income') {
    const account = await Account.findById(transaction.accountId);
    if (account) {
      account.balance += (operation === 'apply' ? amount : -amount);
      await account.save();
    }
  } else if (transaction.type === 'expense') {
    const account = await Account.findById(transaction.accountId);
    if (account) {
      account.balance += (operation === 'apply' ? -amount : amount);
      await account.save();
    }
  } else if (transaction.type === 'transfer') {
    // Deduct from source account (From)
    const fromAccount = await Account.findById(transaction.accountId);
    if (fromAccount) {
      fromAccount.balance += (operation === 'apply' ? -amount : amount);
      await fromAccount.save();
    }
    // Add to destination account (To)
    const toAccount = await Account.findById(transaction.toAccountId);
    if (toAccount) {
      toAccount.balance += (operation === 'apply' ? amount : -amount);
      await toAccount.save();
    }
  }

  // 2. Adjust Loan Remaining Balance (if linked to a loan)
  if (transaction.loanId) {
    const loan = await Loan.findById(transaction.loanId);
    if (loan) {
      const isApply = operation === 'apply';
      const isRepayment = 
        (loan.type === 'borrowed' && transaction.type === 'expense') ||
        (loan.type === 'lent' && transaction.type === 'income');
      
      if (loan.type === 'borrowed') {
        // Borrowed Loan: 
        // Expense (repayment) reduces loan remaining balance.
        // Income (loan disbursement) increases loan remaining balance.
        if (transaction.type === 'expense') {
          loan.remainingAmount += (isApply ? -amount : amount);
        } else if (transaction.type === 'income') {
          loan.remainingAmount += (isApply ? amount : -amount);
        }
      } else if (loan.type === 'lent') {
        // Lent Loan (debt owed to us):
        // Income (repayment received) reduces remaining balance.
        // Expense (lending more money) increases remaining balance.
        if (transaction.type === 'income') {
          loan.remainingAmount += (isApply ? -amount : amount);
        } else if (transaction.type === 'expense') {
          loan.remainingAmount += (isApply ? amount : -amount);
        }
      }

      // Ensure remaining amount never goes below 0
      loan.remainingAmount = Math.max(0, loan.remainingAmount);
      
      if (isRepayment) {
        if (isApply) {
          // Find next unpaid installment
          const { data: nextIns } = await supabase
            .from('loan_installments')
            .select('*')
            .eq('loanId', loan._id)
            .neq('status', 'paid')
            .order('installmentNumber', { ascending: true })
            .limit(1);

          if (nextIns && nextIns.length > 0) {
            await supabase
              .from('loan_installments')
              .update({
                status: 'paid',
                paidDate: new Date().toISOString(),
                transactionId: transaction._id
              })
              .eq('id', nextIns[0].id);

            loan.installmentsPaid = (loan.installmentsPaid || 0) + 1;
          }
        } else {
          // Revert installment
          await supabase
            .from('loan_installments')
            .update({
              status: 'upcoming',
              paidDate: null,
              transactionId: null
            })
            .eq('transactionId', transaction._id);

          loan.installmentsPaid = Math.max(0, (loan.installmentsPaid || 0) - 1);
        }
      }

      // Update nextDueDate based on the first unpaid installment
      const { data: upcomingIns } = await supabase
        .from('loan_installments')
        .select('dueDate')
        .eq('loanId', loan._id)
        .eq('status', 'upcoming')
        .order('installmentNumber', { ascending: true })
        .limit(1);

      if (upcomingIns && upcomingIns.length > 0) {
        loan.nextDueDate = upcomingIns[0].dueDate;
        loan.status = 'active';
      } else {
        loan.nextDueDate = null;
        loan.status = 'completed';
      }

      if (loan.remainingAmount <= 0) {
        loan.status = 'completed';
        loan.nextDueDate = null;
        
        // If applying and remaining amount is 0, mark all remaining unpaid installments as paid
        if (isApply) {
          await supabase
            .from('loan_installments')
            .update({
              status: 'paid',
              paidDate: new Date().toISOString()
            })
            .eq('loanId', loan._id)
            .neq('status', 'paid');
          
          loan.installmentsPaid = loan.totalInstallments;
        }
      }
      
      await loan.save();
    }
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { type, title, amount, category, paymentMethod, description, transactionDate, accountId, toAccountId, loanId } = req.body;

    if (!type || !title?.trim() || amount === undefined || Number(amount) <= 0 || !category?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type, title, amount greater than zero and category'
      });
    }

    if (type === 'transfer') {
      if (!accountId || !toAccountId || accountId.toString() === toAccountId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Transfers require a source (From) and a different destination (To) account'
        });
      }
    }

    // Resolve or find accountId if not provided (fallback for backward compatibility)
    let finalAccountId = accountId;
    if (!finalAccountId) {
      let defaultAccount = await Account.findOne({ userId: req.userId, type: paymentMethod === 'cash' ? 'cash' : 'bank' });
      if (!defaultAccount) {
        defaultAccount = await Account.create({
          userId: req.userId,
          type: paymentMethod === 'cash' ? 'cash' : 'bank',
          name: paymentMethod === 'cash' ? 'Cash' : 'State Bank of India',
          balance: 0
        });
      }
      finalAccountId = defaultAccount._id;
    }

    const transaction = await Transaction.create({
      userId: req.userId,
      type,
      title: title.trim(),
      amount: Number(amount),
      category: category.trim(),
      paymentMethod: paymentMethod || (type === 'transfer' ? 'bank_transfer' : 'other'),
      accountId: finalAccountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      loanId: loanId || undefined,
      description: description?.trim(),
      transactionDate: transactionDate || new Date()
    });

    // Adjust balance of the accounts
    await adjustBalances(transaction, 'apply');

    // Populate account and loan details to return
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('accountId', 'name type')
      .populate('toAccountId', 'name type')
      .populate('loanId', 'title type lenderName remainingAmount');

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: populatedTransaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, type, search, sort = 'latest', accountId, loanId } = req.query;

    const query = { userId: req.userId };
    if (category) query.category = category;
    if (type) query.type = type;
    if (loanId) query.loanId = loanId;
    if (accountId) {
      query.$or = [
        { accountId },
        { toAccountId: accountId }
      ];
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortMap = {
      latest: { transactionDate: -1 },
      oldest: { transactionDate: 1 },
      amount_desc: { amount: -1 },
      amount_asc: { amount: 1 }
    };

    const transactions = await Transaction.find(query)
      .populate('accountId', 'name type')
      .populate('toAccountId', 'name type')
      .populate('loanId', 'title type lenderName remainingAmount')
      .sort(sortMap[sort] || sortMap.latest)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, amount, category, paymentMethod, description, transactionDate, accountId, toAccountId, loanId } = req.body;

    const oldTransaction = await Transaction.findOne({ _id: id, userId: req.userId });
    if (!oldTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (type && !['income', 'expense', 'transfer'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Transaction type must be income, expense or transfer'
      });
    }

    const newType = type !== undefined ? type : oldTransaction.type;
    const newFrom = accountId !== undefined ? accountId : oldTransaction.accountId;
    const newTo = toAccountId !== undefined ? toAccountId : oldTransaction.toAccountId;

    if (newType === 'transfer') {
      if (!newFrom || !newTo || newFrom.toString() === newTo.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Transfers require a source (From) and a different destination (To) account'
        });
      }
    }

    // Revert old balance effect
    await adjustBalances(oldTransaction, 'revert');

    // Update fields
    if (type !== undefined) oldTransaction.type = type;
    if (title !== undefined) oldTransaction.title = title.trim();
    if (amount !== undefined) oldTransaction.amount = Number(amount);
    if (category !== undefined) oldTransaction.category = category.trim();
    if (paymentMethod !== undefined) oldTransaction.paymentMethod = paymentMethod;
    if (description !== undefined) oldTransaction.description = description?.trim();
    if (transactionDate !== undefined) oldTransaction.transactionDate = transactionDate;
    if (accountId !== undefined) oldTransaction.accountId = accountId;
    if (loanId !== undefined) oldTransaction.loanId = loanId || undefined;
    
    if (newType === 'transfer') {
      oldTransaction.toAccountId = newTo;
    } else {
      oldTransaction.toAccountId = undefined;
    }

    await oldTransaction.save();

    // Apply new balance effect
    await adjustBalances(oldTransaction, 'apply');

    const populatedTransaction = await Transaction.findById(oldTransaction._id)
      .populate('accountId', 'name type')
      .populate('toAccountId', 'name type')
      .populate('loanId', 'title type lenderName remainingAmount');

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: populatedTransaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({ _id: id, userId: req.userId });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Revert balance effect
    await adjustBalances(transaction, 'revert');

    await Transaction.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};