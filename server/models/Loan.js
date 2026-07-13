import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title/description for the loan']
  },
  type: {
    type: String,
    enum: ['borrowed', 'lent'], // borrowed = loan taken, lent = money given to someone else
    required: [true, 'Please specify whether the loan is borrowed or lent']
  },
  mainCategory: {
    type: String,
    enum: ['bank', 'personal'], // bank loan or personal debt
    required: [true, 'Please specify if the loan is a bank loan or a personal debt']
  },
  subCategory: {
    type: String,
    // Bank sub-options: 'home', 'car', 'education', 'personal', 'business', 'other'
    // Personal sub-options: 'friend', 'family', 'colleague', 'other'
    required: [true, 'Please specify the sub-category of the loan']
  },
  lenderName: {
    type: String, // Bank name or Person name
    required: [true, 'Please specify the lender or borrower name']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please provide the total loan amount'],
    min: [0, 'Amount cannot be negative']
  },
  remainingAmount: {
    type: Number,
    required: [true, 'Please provide the remaining loan amount'],
    min: [0, 'Amount cannot be negative']
  },
  interestRate: {
    type: Number,
    default: 0, // Annual interest rate in %
    min: [0, 'Interest rate cannot be negative']
  },
  emiAmount: {
    type: Number,
    default: 0, // Monthly EMI, if applicable
    min: [0, 'EMI amount cannot be negative']
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date for the loan'],
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'paid'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

loanSchema.index({ userId: 1, type: 1 });
loanSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Loan', loanSchema);
