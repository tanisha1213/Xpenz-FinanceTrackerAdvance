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

    // 2. Run Migration in background to prevent blocking page load
    Transaction.updateMany(
      { userId: req.userId, accountId: { $exists: false } },
      { $set: { accountId: cashAccount._id } }
    ).catch(err => console.error('Migration background run failed:', err));

    // 3. Fetch accounts and compute balance sums
    const accounts = await Account.find({ userId: req.userId }).sort({ type: 1, name: 1 });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const cashBalance = accounts.filter(acc => acc.type === 'cash').reduce((sum, acc) => sum + acc.balance, 0);
    const bankBalance = accounts.filter(acc => acc.type === 'bank').reduce((sum, acc) => sum + acc.balance, 0);

    // 4. Optimize queries by filtering for current month and limiting recent fetches
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const sixMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [currentMonthTransactions, trendTransactions, recentTransactions, budget] = await Promise.all([
      Transaction.find({
        userId: req.userId,
        transactionDate: { $gte: currentMonthStart, $lt: currentMonthEnd }
      }).populate('accountId', 'name type'),
      
      Transaction.find({
        userId: req.userId,
        transactionDate: { $gte: sixMonthsAgoStart, $lt: currentMonthEnd }
      }),
      
      Transaction.find({ userId: req.userId })
        .populate('accountId', 'name type')
        .sort({ transactionDate: -1 })
        .limit(5),
        
      Budget.findOne({ userId: req.userId })
    ]);

    // Summarize current month's spending
    const summary = summarizeTransactions(currentMonthTransactions, budget);
    
    // Summarize last 6 months for the trend chart
    const trendSummary = summarizeTransactions(trendTransactions, budget);

    res.status(200).json({
      success: true,
      data: {
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        savings: summary.savings, // Current month savings (Net Savings card)
        totalBalance, // Real-time actual accounts sum (Total Balance hero card)
        cashBalance,
        bankBalance,
        accounts,
        budgetRemaining: summary.budgetRemaining,
        monthlyTrend: trendSummary.monthlyTrend,
        categoryBreakdown: summary.categoryBreakdown,
        recentTransactions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};