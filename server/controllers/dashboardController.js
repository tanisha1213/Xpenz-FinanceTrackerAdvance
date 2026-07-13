import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Account from '../models/Account.js';
import { summarizeTransactions } from '../services/financeAnalyzer.js';

export const getDashboardSummary = async (req, res) => {
  try {
    // 1. Initialize default accounts if they don't exist
    let cashAccount = await Account.findOne({ userId: req.userId, type: 'cash' });
    if (!cashAccount) {
      cashAccount = await Account.create({
        userId: req.userId,
        type: 'cash',
        name: 'Cash',
        balance: 0
      });
    }

    let bankAccounts = await Account.find({ userId: req.userId, type: 'bank' });
    if (bankAccounts.length === 0) {
      const defaultBank = await Account.create({
        userId: req.userId,
        type: 'bank',
        name: 'State Bank of India',
        balance: 0
      });
      bankAccounts = [defaultBank];
    }

    // 2. Migration: Map any transactions that lack accountId to the default cash account
    await Transaction.updateMany(
      { userId: req.userId, accountId: { $exists: false } },
      { $set: { accountId: cashAccount._id } }
    );

    // 3. Fetch accounts and compute balance sums
    const accounts = await Account.find({ userId: req.userId }).sort({ type: 1, name: 1 });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const cashBalance = accounts.filter(acc => acc.type === 'cash').reduce((sum, acc) => sum + acc.balance, 0);
    const bankBalance = accounts.filter(acc => acc.type === 'bank').reduce((sum, acc) => sum + acc.balance, 0);

    const transactions = await Transaction.find({ userId: req.userId })
      .populate('accountId', 'name type')
      .sort({ transactionDate: -1 });

    const budget = await Budget.findOne({ userId: req.userId });
    const summary = summarizeTransactions(transactions, budget);

    res.status(200).json({
      success: true,
      data: {
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        savings: summary.savings, // Keep savings as it was for backward compatibility
        totalBalance,
        cashBalance,
        bankBalance,
        accounts,
        budgetRemaining: summary.budgetRemaining,
        monthlyTrend: summary.monthlyTrend,
        categoryBreakdown: summary.categoryBreakdown,
        recentTransactions: transactions.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};