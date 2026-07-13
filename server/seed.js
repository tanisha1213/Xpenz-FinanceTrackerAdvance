import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import Account from './models/Account.js';
import Transaction from './models/Transaction.js';
import Budget from './models/Budget.js';
import Loan from './models/Loan.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-finance-tracker';
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // 1. Create/Reset Test User
    const testEmail = 'test@example.com';
    console.log(`Setting up test user: ${testEmail}...`);
    
    // Delete existing test user if present (to allow re-running seed script)
    const existingUser = await User.findOne({ email: testEmail });
    if (existingUser) {
      console.log('Removing old test user data...');
      await Transaction.deleteMany({ userId: existingUser._id });
      await Account.deleteMany({ userId: existingUser._id });
      await Budget.deleteMany({ userId: existingUser._id });
      await Loan.deleteMany({ userId: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
    }

    // Create the user
    const user = await User.create({
      name: 'Test User',
      email: testEmail,
      password: 'password123'
    });

    console.log('Test User created successfully (Password: password123).');

    // 2. Create Accounts
    console.log('Creating financial accounts...');
    const cashAccount = await Account.create({
      userId: user._id,
      type: 'cash',
      name: 'Cash',
      balance: 15000 // Initial balance
    });

    const sbiAccount = await Account.create({
      userId: user._id,
      type: 'bank',
      name: 'State Bank of India',
      balance: 55000 // Initial balance
    });

    const hdfcAccount = await Account.create({
      userId: user._id,
      type: 'bank',
      name: 'HDFC Bank',
      balance: 110000 // Initial balance
    });

    const accountMap = {
      'Cash': cashAccount,
      'State Bank of India': sbiAccount,
      'HDFC Bank': hdfcAccount
    };

    // 3. Create Budget
    console.log('Creating monthly budget...');
    await Budget.create({
      userId: user._id,
      monthlyBudget: 50000,
      categoryBudgets: [
        { category: 'Food', limit: 10000 },
        { category: 'Transport', limit: 5000 },
        { category: 'Shopping', limit: 15000 },
        { category: 'Entertainment', limit: 8000 },
        { category: 'Bills', limit: 12000 },
        { category: 'Healthcare', limit: 3000 },
        { category: 'Education', limit: 5000 },
        { category: 'Other', limit: 2000 }
      ]
    });

    const now = new Date();
    const daysAgo = (days) => {
      const d = new Date();
      d.setDate(now.getDate() - days);
      return d;
    };

    // 4. Create Dummy Loans/Debts
    console.log('Creating dummy loans & debts...');
    
    // Bank Loan (borrowed) - Home Loan with EMI
    const homeLoan = await Loan.create({
      userId: user._id,
      title: 'HDFC Home Loan',
      type: 'borrowed',
      mainCategory: 'bank',
      subCategory: 'home',
      lenderName: 'HDFC Bank',
      totalAmount: 1500000,
      remainingAmount: 1470000, // Reduced after EMIs in seed
      interestRate: 8.5,
      emiAmount: 15000,
      startDate: daysAgo(90),
      status: 'active'
    });

    // Personal Debt Taken (borrowed) - Money borrowed from family
    const laptopDebt = await Loan.create({
      userId: user._id,
      title: 'Laptop Loan from Uncle',
      type: 'borrowed',
      mainCategory: 'personal',
      subCategory: 'family',
      lenderName: 'Uncle John',
      totalAmount: 60000,
      remainingAmount: 50000, // Reduced after payments in seed
      interestRate: 0,
      emiAmount: 5000,
      startDate: daysAgo(60),
      status: 'active'
    });

    // Personal Debt Given (lent) - Money lent to a friend
    const friendLent = await Loan.create({
      userId: user._id,
      title: 'Emergency Cash for Raj',
      type: 'lent',
      mainCategory: 'personal',
      subCategory: 'friend',
      lenderName: 'Friend Raj',
      totalAmount: 20000,
      remainingAmount: 17500, // Reduced after repayments in seed
      interestRate: 0,
      emiAmount: 2500,
      startDate: daysAgo(45),
      status: 'active'
    });

    const loanMap = {
      'HDFC Home Loan': homeLoan,
      'Laptop Loan from Uncle': laptopDebt,
      'Emergency Cash for Raj': friendLent
    };

    // 5. Define Transactions (including some linked to loans!)
    console.log('Generating dummy transactions...');

    const rawTransactions = [
      {
        type: 'income',
        title: 'Monthly Salary',
        amount: 85000,
        category: 'Salary',
        paymentMethod: 'bank_transfer',
        accountName: 'HDFC Bank',
        description: 'Monthly payroll transfer',
        date: daysAgo(29)
      },
      {
        type: 'income',
        title: 'Freelance Design Project',
        amount: 25000,
        category: 'Freelance',
        paymentMethod: 'bank_transfer',
        accountName: 'State Bank of India',
        description: 'Payment for website UI design',
        date: daysAgo(25)
      },
      {
        type: 'expense',
        title: 'Apartment Rent',
        amount: 22000,
        category: 'Rent',
        paymentMethod: 'bank_transfer',
        accountName: 'HDFC Bank',
        description: 'Monthly house rent',
        date: daysAgo(28)
      },
      {
        type: 'expense',
        title: 'Electricity & Power Bill',
        amount: 4200,
        category: 'Bills',
        paymentMethod: 'card',
        accountName: 'HDFC Bank',
        description: 'Summer electricity bill payment',
        date: daysAgo(22)
      },
      {
        type: 'expense',
        title: 'Weekly Groceries',
        amount: 2800,
        category: 'Food',
        paymentMethod: 'upi',
        accountName: 'State Bank of India',
        description: 'Supermarket grocery haul',
        date: daysAgo(21)
      },
      {
        type: 'transfer',
        title: 'ATM Cash Withdrawal',
        amount: 8000,
        category: 'Other',
        paymentMethod: 'other',
        accountName: 'State Bank of India',
        toAccountName: 'Cash',
        description: 'Withdrew cash for daily expenses',
        date: daysAgo(18)
      },
      {
        type: 'expense',
        title: 'Restaurant Dinner',
        amount: 1500,
        category: 'Food',
        paymentMethod: 'cash',
        accountName: 'Cash',
        description: 'Dinner with friends',
        date: daysAgo(17)
      },
      {
        type: 'expense',
        title: 'Weekend Movies',
        amount: 950,
        category: 'Entertainment',
        paymentMethod: 'upi',
        accountName: 'State Bank of India',
        description: 'Movie tickets and snacks',
        date: daysAgo(15)
      },
      {
        type: 'expense',
        title: 'Gym Monthly Membership',
        amount: 2000,
        category: 'Healthcare',
        paymentMethod: 'card',
        accountName: 'HDFC Bank',
        description: 'Monthly fitness center fees',
        date: daysAgo(14)
      },
      {
        type: 'expense',
        title: 'Car Fuel Fill-up',
        amount: 3200,
        category: 'Transport',
        paymentMethod: 'upi',
        accountName: 'State Bank of India',
        description: 'Full tank petrol',
        date: daysAgo(12)
      },
      {
        type: 'expense',
        title: 'Shopping Mall Clothing',
        amount: 6800,
        category: 'Shopping',
        paymentMethod: 'card',
        accountName: 'HDFC Bank',
        description: 'Bought clothes and shoes',
        date: daysAgo(10)
      },
      {
        type: 'expense',
        title: 'Broadband Internet Bill',
        amount: 1199,
        category: 'Bills',
        paymentMethod: 'upi',
        accountName: 'State Bank of India',
        description: 'Monthly internet subscription',
        date: daysAgo(8)
      },
      {
        type: 'expense',
        title: 'Pharmacy Medicines',
        amount: 650,
        category: 'Healthcare',
        paymentMethod: 'cash',
        accountName: 'Cash',
        description: 'Vitamin supplements and medicine',
        date: daysAgo(7)
      },
      {
        type: 'expense',
        title: 'Cafe Espresso & Bakery',
        amount: 450,
        category: 'Food',
        paymentMethod: 'cash',
        accountName: 'Cash',
        description: 'Afternoon coffee break',
        date: daysAgo(6)
      },
      {
        type: 'transfer',
        title: 'Emergency Wallet Transfer',
        amount: 4000,
        category: 'Other',
        paymentMethod: 'other',
        accountName: 'HDFC Bank',
        toAccountName: 'Cash',
        description: 'Transferred to cash reserve',
        date: daysAgo(5)
      },
      {
        type: 'expense',
        title: 'Cab/Uber Ride to Office',
        amount: 550,
        category: 'Transport',
        paymentMethod: 'upi',
        accountName: 'HDFC Bank',
        description: 'Commute to office',
        date: daysAgo(4)
      },
      {
        type: 'expense',
        title: 'Online Course Subscription',
        amount: 3500,
        category: 'Education',
        paymentMethod: 'card',
        accountName: 'State Bank of India',
        description: 'React native development course',
        date: daysAgo(3)
      },
      {
        type: 'expense',
        title: 'Food Delivery order',
        amount: 1200,
        category: 'Food',
        paymentMethod: 'upi',
        accountName: 'HDFC Bank',
        description: 'Ordered dinner online',
        date: daysAgo(2)
      },
      {
        type: 'expense',
        title: 'Mobile Phone Recharge',
        amount: 799,
        category: 'Bills',
        paymentMethod: 'upi',
        accountName: 'State Bank of India',
        description: 'Prepaid mobile recharge',
        date: daysAgo(1)
      },
      {
        type: 'income',
        title: 'Dividends Payout',
        amount: 1500,
        category: 'Investments',
        paymentMethod: 'bank_transfer',
        accountName: 'HDFC Bank',
        description: 'Stock dividend credit',
        date: now
      },
      // LINKED LOAN TRANSACTIONS
      {
        type: 'expense',
        title: 'Home Loan EMI Auto-Debit',
        amount: 15000,
        category: 'Bills',
        paymentMethod: 'bank_transfer',
        accountName: 'HDFC Bank',
        description: 'Monthly home loan EMI payment',
        date: daysAgo(28),
        loanName: 'HDFC Home Loan'
      },
      {
        type: 'expense',
        title: 'Home Loan EMI Auto-Debit',
        amount: 15000,
        category: 'Bills',
        paymentMethod: 'bank_transfer',
        accountName: 'HDFC Bank',
        description: 'Monthly home loan EMI payment',
        date: daysAgo(1),
        loanName: 'HDFC Home Loan'
      },
      {
        type: 'expense',
        title: 'Laptop Loan Repayment',
        amount: 5000,
        category: 'Bills',
        paymentMethod: 'upi',
        accountName: 'State Bank of India',
        description: 'EMI payment to Uncle John',
        date: daysAgo(20),
        loanName: 'Laptop Loan from Uncle'
      },
      {
        type: 'expense',
        title: 'Laptop Loan Repayment',
        amount: 5000,
        category: 'Bills',
        paymentMethod: 'upi',
        accountName: 'State Bank of India',
        description: 'EMI payment to Uncle John',
        date: daysAgo(3),
        loanName: 'Laptop Loan from Uncle'
      },
      {
        type: 'income',
        title: 'Raj Debt Payback Installment',
        amount: 2500,
        category: 'Other',
        paymentMethod: 'upi',
        accountName: 'State Bank of India',
        description: 'Lent money repayment from Raj',
        date: daysAgo(15),
        loanName: 'Emergency Cash for Raj'
      }
    ];

    // 6. Insert Transactions and Adjust Account Balances + Loan Balances
    console.log('Inserting transactions and updating account/loan balances dynamically...');
    
    for (const rawTx of rawTransactions) {
      const sourceAccount = accountMap[rawTx.accountName];
      const destAccount = rawTx.toAccountName ? accountMap[rawTx.toAccountName] : null;
      const linkedLoan = rawTx.loanName ? loanMap[rawTx.loanName] : null;

      const tx = await Transaction.create({
        userId: user._id,
        type: rawTx.type,
        title: rawTx.title,
        amount: rawTx.amount,
        category: rawTx.category,
        paymentMethod: rawTx.paymentMethod,
        accountId: sourceAccount._id,
        toAccountId: destAccount ? destAccount._id : undefined,
        loanId: linkedLoan ? linkedLoan._id : undefined,
        description: rawTx.description,
        transactionDate: rawTx.date
      });

      // Adjust account balances in memory
      if (rawTx.type === 'income') {
        sourceAccount.balance += rawTx.amount;
      } else if (rawTx.type === 'expense') {
        sourceAccount.balance -= rawTx.amount;
      } else if (rawTx.type === 'transfer' && destAccount) {
        sourceAccount.balance -= rawTx.amount;
        destAccount.balance += rawTx.amount;
      }
    }

    // Save final updated account balances
    console.log('Saving final adjusted account balances...');
    await cashAccount.save();
    await sbiAccount.save();
    await hdfcAccount.save();

    console.log('Database seeded successfully!');
    console.log('\n--- TEST USER ACCOUNT ---');
    console.log(`Email:    ${testEmail}`);
    console.log('Password: password123');
    console.log('-------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
