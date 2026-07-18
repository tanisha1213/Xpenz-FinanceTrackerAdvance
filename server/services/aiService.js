import OpenAI from 'openai';
import { analyzeFinance } from './financeAnalyzer.js';

const hasOpenAIKey = () => {
  const key = process.env.OPENAI_API_KEY;
  return key && key !== 'your_openai_api_key_here';
};

export const generateAIInsights = async ({ transactions, budget }) => {
  const analysis = analyzeFinance({ transactions, budget });

  if (!hasOpenAIKey()) {
    return {
      provider: 'heuristic',
      insights: [...analysis.insights, ...analysis.recommendations].slice(0, 8)
    };
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = [
      'Generate concise personal finance insights for this user.',
      'Return only a JSON array of strings.',
      JSON.stringify({
        totalIncome: analysis.totalIncome,
        totalExpense: analysis.totalExpense,
        savings: analysis.savings,
        budgetRemaining: analysis.budgetRemaining,
        categoryBreakdown: analysis.categoryBreakdown,
        monthlyTrend: analysis.monthlyTrend
      })
    ].join('\n');

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4
    });

    const text = response.choices?.[0]?.message?.content || '[]';
    const insights = JSON.parse(text);

    return {
      provider: 'openai',
      insights: Array.isArray(insights) && insights.length ? insights : analysis.insights
    };
  } catch (error) {
    return {
      provider: 'heuristic',
      insights: [...analysis.insights, ...analysis.recommendations].slice(0, 8)
    };
  }
};

export const predictExpense = async ({ transactions, budget, investments = [], insurances = [], loans = [] }) => {
  const analysis = analyzeFinance({ transactions, budget });

  // Calculate Financial Inclusion Score
  let score = 0;
  const advice = [];

  const totalIncome = analysis.totalIncome || 0;
  const totalExpense = analysis.totalExpense || 0;
  const savings = totalIncome - totalExpense;

  // 1. Savings Buffer (25 points)
  if (totalIncome > 0) {
    const savingsRate = savings / totalIncome;
    if (savingsRate > 0.2) {
      score += 25;
    } else if (savingsRate > 0) {
      score += 15;
      advice.push("Try to increase your monthly savings rate to at least 20% of your income.");
    } else {
      advice.push("Your expenses exceed your income. Create a strict budget to stop drawing down on your cash.");
    }
  } else {
    advice.push("Log your regular income sources to establish your savings capacity.");
  }

  // 2. Investment Presence (25 points)
  if (investments.length > 0) {
    const uniqueTypes = new Set(investments.map(i => i.type));
    if (uniqueTypes.size >= 2) {
      score += 25;
    } else {
      score += 15;
      advice.push("Consider diversifying your wealth across other assets (e.g., FDs, PPF, or Mutual Funds).");
    }
  } else {
    advice.push("You haven't logged any active investments. Start a small SIP or Recurring Deposit to build wealth.");
  }

  // 3. Insurance Coverage (25 points)
  const activeInsurances = insurances.filter(ins => ins.status === 'active');
  if (activeInsurances.length > 0) {
    const uniqueInsTypes = new Set(activeInsurances.map(i => i.type));
    if (uniqueInsTypes.size >= 2) {
      score += 25;
    } else {
      score += 15;
      advice.push("Ensure you have both Health and Vehicle/Life insurance for comprehensive coverage.");
    }
  } else {
    advice.push("No active insurance logged. Protect your family from emergencies by securing health or term insurance.");
  }

  // 4. Debt Health (25 points)
  const activeLoans = loans.filter(l => l.status === 'active');
  if (activeLoans.length === 0) {
    score += 25;
  } else {
    const totalRemainingDebt = activeLoans.reduce((sum, l) => sum + (l.remainingAmount || 0), 0);
    const annualIncomeEstimate = totalIncome * 12;
    if (annualIncomeEstimate > 0) {
      const debtToIncomeRatio = totalRemainingDebt / annualIncomeEstimate;
      if (debtToIncomeRatio < 0.3) {
        score += 15;
      } else if (debtToIncomeRatio < 0.5) {
        score += 8;
        advice.push("Your total outstanding debt is notable. Avoid taking additional high-interest bank loans.");
      } else {
        advice.push("Your debt-to-income ratio is high. Prioritize loan prepayments to escape high interest burdens.");
      }
    } else {
      score += 10;
      advice.push("Prioritize paying off outstanding loans to improve your net credit health.");
    }
  }

  // Define tier
  let tier = 'Basic';
  if (score >= 85) tier = 'Excellent';
  else if (score >= 65) tier = 'Good';
  else if (score >= 40) tier = 'Fair';

  if (advice.length === 0) {
    advice.push("Outstanding! You maintain an exceptionally healthy, well-diversified financial profile.");
  }

  // Calculate Cashflow Run-out status
  const totalCashBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const now = new Date();
  const currentDay = now.getDate();
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, totalDaysInMonth - currentDay);
  const dailySpendRate = currentDay > 0 ? (totalExpense / currentDay) : 0;
  
  let daysOfCashRemaining = 999;
  if (dailySpendRate > 0) {
    daysOfCashRemaining = Math.max(0, Math.round(totalCashBalance / dailySpendRate));
  }
  const willRunOut = dailySpendRate > 0 && (totalCashBalance < (dailySpendRate * daysRemaining));

  // Cheaper Alternatives & Spend Reduction suggestions
  const cheaperAlternatives = [];
  const spendMap = {};
  transactions.forEach(t => {
    if (t.type === 'expense' && t.category) {
      spendMap[t.category] = (spendMap[t.category] || 0) + (t.amount || 0);
    }
  });

  const sortedCategories = Object.entries(spendMap).sort((a, b) => b[1] - a[1]);
  if (sortedCategories.length > 0) {
    sortedCategories.slice(0, 3).forEach(([cat, amt]) => {
      const lowerCat = cat.toLowerCase();
      if (lowerCat.includes('food') || lowerCat.includes('dining') || lowerCat.includes('restaurant')) {
        cheaperAlternatives.push({
          category: cat,
          amount: amt,
          suggestion: "Reduce dining out/orders. Prep meals at home to cut costs by ~60%."
        });
      } else if (lowerCat.includes('entertainment') || lowerCat.includes('leisure') || lowerCat.includes('movie')) {
        cheaperAlternatives.push({
          category: cat,
          amount: amt,
          suggestion: "Audit active streaming apps. Keep one, cancel the rest to save ~80%."
        });
      } else if (lowerCat.includes('shopping') || lowerCat.includes('clothes') || lowerCat.includes('apparel')) {
        cheaperAlternatives.push({
          category: cat,
          amount: amt,
          suggestion: "Apply a 48-hour cool-off rule before buying non-essentials to save ~40%."
        });
      } else if (lowerCat.includes('commute') || lowerCat.includes('fuel') || lowerCat.includes('travel') || lowerCat.includes('cab')) {
        cheaperAlternatives.push({
          category: cat,
          amount: amt,
          suggestion: "Consolidate travel routes or switch to public transit to save ~30%."
        });
      } else {
        cheaperAlternatives.push({
          category: cat,
          amount: amt,
          suggestion: `Curb discretionary outlays in ${cat}. Set a category budget to save ~20%.`
        });
      }
    });
  }

  if (cheaperAlternatives.length === 0) {
    cheaperAlternatives.push({
      category: 'General',
      amount: 0,
      suggestion: "Create category budgets to begin optimizing your monthly cash outflows."
    });
  }

  return {
    predictedExpense: analysis.predictedExpense,
    confidence: analysis.confidence,
    budgetRisk: analysis.monthlyBudget > 0 ? analysis.predictedExpense > analysis.monthlyBudget : false,
    recommendations: analysis.recommendations,
    financialInclusion: {
      score,
      tier,
      advice
    },
    cashflowForecast: {
      totalCashBalance,
      dailySpendRate: Math.round(dailySpendRate),
      daysRemaining,
      daysOfCashRemaining,
      willRunOut,
      cheaperAlternatives
    }
  };
};