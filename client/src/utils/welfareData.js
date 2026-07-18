export const governmentSchemes = [
  {
    id: 'pm-kisan',
    name: 'PM Kisan Samman Nidhi',
    description: 'Income support of INR 6,000 per year in three equal installments to all landholding farmer families.',
    minAge: 18,
    maxAge: 100,
    maxIncome: 300000,
    gender: 'any',
    category: 'any',
    link: 'https://pmkisan.gov.in/'
  },
  {
    id: 'apy',
    name: 'Atal Pension Yojana (APY)',
    description: 'Guaranteed minimum pension of INR 1,000 to INR 5,000 per month after age 60, depending on contributions.',
    minAge: 18,
    maxAge: 40,
    maxIncome: 1000000,
    gender: 'any',
    category: 'any',
    link: 'https://www.npscra.nsdl.co.in/'
  },
  {
    id: 'pmjdy',
    name: 'Pradhan Mantri Jan Dhan Yojana',
    description: 'National Mission for Financial Inclusion to ensure access to financial services, savings accounts, and overdraft options.',
    minAge: 10,
    maxAge: 100,
    maxIncome: 1500000,
    gender: 'any',
    category: 'any',
    link: 'https://pmjdy.gov.in/'
  },
  {
    id: 'sukanya',
    name: 'Sukanya Samriddhi Yojana (SSY)',
    description: 'A small deposit scheme for girl children, offering high tax-free interest and savings for education/marriage.',
    minAge: 0,
    maxAge: 10,
    maxIncome: 2000000,
    gender: 'female',
    category: 'any',
    link: 'https://www.indiapost.gov.in/'
  },
  {
    id: 'pm-svanidhi',
    name: 'PM Svanidhi (Street Vendor\'s AtmaNirbhar Nidhi)',
    description: 'Special micro-credit facility scheme for street vendors to access collateral-free working capital loans.',
    minAge: 18,
    maxAge: 100,
    maxIncome: 200000,
    gender: 'any',
    category: 'any',
    link: 'https://pmsvanidhi.mohua.gov.in/'
  },
  {
    id: 'standup-india',
    name: 'Stand-Up India Scheme',
    description: 'Facilitates bank loans between INR 10 Lakhs and 1 Crore to at least one SC/ST borrower and one woman borrower per bank branch.',
    minAge: 18,
    maxAge: 100,
    maxIncome: 5000000,
    gender: 'female',
    category: 'SC/ST',
    link: 'https://www.standupmitra.in/'
  }
];

export const scholarships = [
  {
    id: 'central-sector',
    name: 'Central Sector Scheme of Scholarship for College and University Students',
    description: 'Financial assistance to meritorious students from low-income families to meet day-to-day college expenses.',
    level: 'undergrad',
    maxIncome: 450000,
    category: 'any',
    amount: 'INR 12,000 - 20,000 per annum'
  },
  {
    id: 'post-matric-sc',
    name: 'Post Matric Scholarship for SC Students',
    description: 'Scholarship provided to SC students for pursuing post-matriculation courses to lower dropouts.',
    level: 'any',
    maxIncome: 250000,
    category: 'SC',
    amount: 'Full tuition fees and maintenance allowance'
  },
  {
    id: 'post-matric-obc',
    name: 'Post Matric Scholarship for OBC Students',
    description: 'Financial support to students belonging to OBC category pursuing higher education.',
    level: 'any',
    maxIncome: 250000,
    category: 'OBC',
    amount: 'Partial course fee reimbursement and allowances'
  },
  {
    id: 'nmmss',
    name: 'National Means-Cum-Merit Scholarship Scheme (NMMSS)',
    description: 'Scholarship to award scholarships to meritorious students of economically weaker sections to arrest dropouts in class VIII.',
    level: 'school',
    maxIncome: 350000,
    category: 'any',
    amount: 'INR 12,000 per annum'
  }
];
