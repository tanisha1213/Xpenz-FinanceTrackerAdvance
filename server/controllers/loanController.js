import Loan from '../models/Loan.js';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';

// Get all loans for the logged-in user
export const getLoans = async (req, res) => {
  try {
    const userId = req.userId;
    const loans = await Loan.find({ userId }).sort({ status: 1, startDate: -1 });

    res.status(200).json({
      success: true,
      data: loans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add a new loan / debt
export const addLoan = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      title,
      type,
      mainCategory,
      subCategory,
      lenderName,
      totalAmount,
      interestRate,
      emiAmount,
      startDate,
      endDate,
      accountId // Optional: Link to an account to deposit/withdraw the initial loan amount
    } = req.body;

    if (!title?.trim() || !type || !mainCategory || !subCategory || !lenderName?.trim() || totalAmount === undefined || Number(totalAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, type, mainCategory, subCategory, lenderName, totalAmount > 0)'
      });
    }

    const loan = await Loan.create({
      userId,
      title: title.trim(),
      type,
      mainCategory,
      subCategory,
      lenderName: lenderName.trim(),
      totalAmount: Number(totalAmount),
      remainingAmount: Number(totalAmount), // Starts equal to total amount
      interestRate: Number(interestRate) || 0,
      emiAmount: Number(emiAmount) || 0,
      startDate: startDate || new Date(),
      endDate: endDate || undefined
    });

    // If an account ID is provided, create an initial transaction for the loan payout
    if (accountId) {
      const account = await Account.findOne({ _id: accountId, userId });
      if (account) {
        // Create corresponding transaction
        const isBorrowed = type === 'borrowed';
        const transaction = await Transaction.create({
          userId,
          type: isBorrowed ? 'income' : 'expense',
          title: isBorrowed ? `Loan Payout: ${title.trim()}` : `Loan Disbursed: ${title.trim()}`,
          amount: Number(totalAmount),
          category: 'Other',
          paymentMethod: 'bank_transfer',
          accountId,
          loanId: loan._id,
          description: `Initial disbursement of ${title.trim()} from ${lenderName.trim()}`,
          transactionDate: startDate || new Date()
        });

        // Adjust account balance
        account.balance += (isBorrowed ? Number(totalAmount) : -Number(totalAmount));
        await account.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Loan added successfully',
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update loan details
export const updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const {
      title,
      type,
      mainCategory,
      subCategory,
      lenderName,
      totalAmount,
      remainingAmount,
      interestRate,
      emiAmount,
      startDate,
      endDate,
      status
    } = req.body;

    const loan = await Loan.findOne({ _id: id, userId });
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (title !== undefined) loan.title = title.trim();
    if (type !== undefined) loan.type = type;
    if (mainCategory !== undefined) loan.mainCategory = mainCategory;
    if (subCategory !== undefined) loan.subCategory = subCategory;
    if (lenderName !== undefined) loan.lenderName = lenderName.trim();
    if (interestRate !== undefined) loan.interestRate = Number(interestRate);
    if (emiAmount !== undefined) loan.emiAmount = Number(emiAmount);
    if (startDate !== undefined) loan.startDate = startDate;
    if (endDate !== undefined) loan.endDate = endDate || undefined;

    // Handle amount changes
    if (totalAmount !== undefined) {
      const diff = Number(totalAmount) - loan.totalAmount;
      loan.totalAmount = Number(totalAmount);
      // Adjust remaining amount by the same difference
      loan.remainingAmount = Math.max(0, loan.remainingAmount + diff);
    }
    
    if (remainingAmount !== undefined) {
      loan.remainingAmount = Number(remainingAmount);
    }

    // Auto-update status based on remaining amount
    if (loan.remainingAmount <= 0) {
      loan.status = 'paid';
    } else if (status !== undefined) {
      loan.status = status;
    } else {
      loan.status = 'active';
    }

    await loan.save();

    res.status(200).json({
      success: true,
      message: 'Loan updated successfully',
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a loan
export const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const loan = await Loan.findOne({ _id: id, userId });
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    // Cascade delete: delete the loan and delete all transactions linked to it
    await Loan.deleteOne({ _id: id });
    await Transaction.deleteMany({ userId, loanId: id });

    res.status(200).json({
      success: true,
      message: 'Loan and all associated payments deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
