import PDFDocument from 'pdfkit';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { summarizeTransactions } from '../services/financeAnalyzer.js';

const formatCurrency = (value) => `INR ${Math.round(value || 0).toLocaleString('en-IN')}`;

export const getMonthlyReport = async (req, res) => {
  try {
    const now = new Date();
    const year = Number(req.query.year) || now.getFullYear();
    const isYearly = req.query.type === 'yearly';

    let start, end, periodStr;
    if (isYearly) {
      start = new Date(year, 0, 1);
      end = new Date(year + 1, 0, 1);
      periodStr = `${year} (Yearly)`;
    } else {
      const month = Number(req.query.month) || now.getMonth() + 1;
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 1);
      periodStr = `${year}-${String(month).padStart(2, '0')}`;
    }

    const transactions = await Transaction.find({
      userId: req.userId,
      transactionDate: { $gte: start, $lt: end }
    })
    .populate('accountId', 'name type')
    .populate('toAccountId', 'name type')
    .sort({ transactionDate: -1 });

    const budget = await Budget.findOne({ userId: req.userId });
    const summary = summarizeTransactions(transactions, budget);

    const report = {
      period: periodStr,
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      savings: summary.savings,
      budgetRemaining: summary.budgetRemaining,
      categoryBreakdown: summary.categoryBreakdown,
      monthlyTrend: summary.monthlyTrend,
      transactions
    };

    if (req.query.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=finance-report-${report.period.replace(/\s+/g, '')}.pdf`);

      const doc = new PDFDocument({ margin: 48 });
      doc.pipe(res);

      // 1. App Header Block
      doc.fillColor('#4f46e5').fontSize(24).font('Helvetica-Bold').text('Xpenz', 48, 48);
      doc.fillColor('#475569').fontSize(10).font('Helvetica').text('Smart Personal Finance Companion', 48, 76);
      
      // Period Right-Aligned
      doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text(`Statement Period: ${report.period}`, 350, 48, { align: 'right', width: 212 });
      
      // Decorative horizontal divider line
      doc.moveDown(0.5);
      doc.strokeColor('#e2e8f0').lineWidth(1.5).moveTo(48, 96).lineTo(562, 96).stroke();

      // Report Header Title
      doc.y = 115;
      doc.fillColor('#1e293b').fontSize(16).font('Helvetica-Bold').text(isYearly ? 'Yearly Financial Report' : 'Monthly Financial Report', 48, doc.y);
      doc.moveDown(1.2);

      // 2. Summary Statistics Grid Cards
      const startY = doc.y;
      const cardW = 118;
      const cardH = 55;
      const gap = 12;

      // Card 1: Total Income
      doc.rect(48, startY, cardW, cardH).fill('#ecfdf5');
      doc.fillColor('#065f46').fontSize(9).font('Helvetica-Bold').text('TOTAL INCOME', 58, startY + 12);
      doc.fillColor('#047857').fontSize(12).font('Helvetica-Bold').text(formatCurrency(report.totalIncome), 58, startY + 28);

      // Card 2: Total Expense
      doc.rect(48 + cardW + gap, startY, cardW, cardH).fill('#fef2f2');
      doc.fillColor('#991b1b').fontSize(9).font('Helvetica-Bold').text('TOTAL EXPENSE', 48 + cardW + gap + 10, startY + 12);
      doc.fillColor('#b91c1c').fontSize(12).font('Helvetica-Bold').text(formatCurrency(report.totalExpense), 48 + cardW + gap + 10, startY + 28);

      // Card 3: Net Savings
      doc.rect(48 + (cardW + gap) * 2, startY, cardW, cardH).fill('#eff6ff');
      doc.fillColor('#1e40af').fontSize(9).font('Helvetica-Bold').text('NET SAVINGS', 48 + (cardW + gap) * 2 + 10, startY + 12);
      doc.fillColor('#1d4ed8').fontSize(12).font('Helvetica-Bold').text(formatCurrency(report.savings), 48 + (cardW + gap) * 2 + 10, startY + 28);

      // Card 4: Budget Left
      doc.rect(48 + (cardW + gap) * 3, startY, cardW, cardH).fill('#f5f3ff');
      doc.fillColor('#5b21b6').fontSize(9).font('Helvetica-Bold').text('BUDGET LEFT', 48 + (cardW + gap) * 3 + 10, startY + 12);
      doc.fillColor('#6d28d9').fontSize(12).font('Helvetica-Bold').text(formatCurrency(report.budgetRemaining), 48 + (cardW + gap) * 3 + 10, startY + 28);

      // Reset coordinates and colors after drawing cards
      doc.y = startY + cardH + 25;
      doc.x = 48;

      // 3. Category Breakdown Section
      doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('Spending Breakdown by Category', 48, doc.y);
      doc.moveDown(0.5);
      
      if (report.categoryBreakdown && report.categoryBreakdown.length > 0) {
        report.categoryBreakdown.forEach((item) => {
          doc.fillColor('#475569').fontSize(10).font('Helvetica').text(`• ${item.category}: `, { continued: true });
          doc.fillColor('#1e293b').font('Helvetica-Bold').text(formatCurrency(item.amount));
        });
      } else {
        doc.fillColor('#94a3b8').fontSize(10).font('Helvetica').text('No expense categories registered this period.');
      }
      doc.moveDown(1.5);

      // 4. Detailed Ledger Section
      doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('Detailed Ledger Statement', 48, doc.y);
      doc.moveDown(0.5);
      
      doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(48, doc.y).lineTo(562, doc.y).stroke();
      doc.moveDown(0.6);

      if (report.transactions && report.transactions.length > 0) {
        report.transactions.slice(0, 150).forEach((item) => {
          const dateStr = new Date(item.transactionDate).toLocaleDateString('en-IN', { timeZone: 'UTC', day: '2-digit', month: 'short' });
          const typeStr = item.type === 'income' ? 'Income' : item.type === 'expense' ? 'Expense' : 'Transfer';
          
          let accountInfo = item.accountId?.name || 'Cash';
          if (item.type === 'transfer') {
            accountInfo = `${item.accountId?.name || 'Cash'} -> ${item.toAccountId?.name || 'Cash'}`;
          }

          const txDesc = `${dateStr}  |  ${item.title}  [${typeStr} - ${accountInfo}]`;
          const txAmount = formatCurrency(item.amount);

          // Render transaction line
          doc.fillColor('#334155').fontSize(9.5).font('Helvetica').text(txDesc, 48, doc.y, { continued: true });
          
          const amountColor = item.type === 'income' ? '#059669' : item.type === 'expense' ? '#dc2626' : '#475569';
          doc.fillColor(amountColor).font('Helvetica-Bold').text(`   ${txAmount}`, { align: 'right' });
          doc.moveDown(0.1);
        });
      } else {
        doc.fillColor('#94a3b8').fontSize(10).font('Helvetica').text('No transaction logs recorded in this period.');
      }

      doc.end();
      return;
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};