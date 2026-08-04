import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Investment from '../models/Investment.js';
import Insurance from '../models/Insurance.js';
import Loan from '../models/Loan.js';
import Account from '../models/Account.js';
import { generateAIInsights, predictExpense } from '../services/aiService.js';

export const generateInsights = async (req, res) => {
  try {
    const userId = req.userId;
    const [transactions, budget] = await Promise.all([
      Transaction.find({ userId }).catch(() => []),
      Budget.findOne({ userId }).catch(() => null)
    ]);

    const result = await generateAIInsights({
      transactions: transactions || [],
      budget: budget || null
    });

    res.status(200).json({
      success: true,
      data: result,
      insights: result.insights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate insights'
    });
  }
};

export const predictSpending = async (req, res) => {
  try {
    const userId = req.userId;
    const [transactions, budget, investments, insurances, loans, accounts] = await Promise.all([
      Transaction.find({ userId }).catch(() => []),
      Budget.findOne({ userId }).catch(() => null),
      Investment.find({ userId }).catch(() => []),
      Insurance.find({ userId }).catch(() => []),
      Loan.find({ userId }).catch(() => []),
      Account.find({ userId }).catch(() => [])
    ]);

    const prediction = await predictExpense({
      transactions: transactions || [],
      budget: budget || null,
      investments: investments || [],
      insurances: insurances || [],
      loans: loans || [],
      accounts: accounts || []
    });

    res.status(200).json({
      success: true,
      data: prediction,
      prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to predict spending'
    });
  }
};