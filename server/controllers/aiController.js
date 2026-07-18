import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Investment from '../models/Investment.js';
import Insurance from '../models/Insurance.js';
import Loan from '../models/Loan.js';
import Account from '../models/Account.js';
import { generateAIInsights, predictExpense } from '../services/aiService.js';

export const generateInsights = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });
    const budget = await Budget.findOne({ userId: req.userId });
    const result = await generateAIInsights({ transactions, budget });

    res.status(200).json({
      success: true,
      data: result,
      insights: result.insights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const predictSpending = async (req, res) => {
  try {
    const [transactions, budget, investments, insurances, loans, accounts] = await Promise.all([
      Transaction.find({ userId: req.userId }),
      Budget.findOne({ userId: req.userId }),
      Investment.find({ userId: req.userId }).catch(() => []),
      Insurance.find({ userId: req.userId }).catch(() => []),
      Loan.find({ userId: req.userId }).catch(() => []),
      Account.find({ userId: req.userId }).catch(() => [])
    ]);
    const prediction = await predictExpense({ transactions, budget, investments, insurances, loans, accounts });

    res.status(200).json({
      success: true,
      data: prediction,
      prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};