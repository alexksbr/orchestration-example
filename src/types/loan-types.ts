export interface LoanApplication {
  applicationId: string;
  customerId: string;
  amount: number;
  term: number; // in months
  purpose: string;
  employmentStatus: string;
  annualIncome: number;
  monthlyExpenses: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

export interface CreditCheckResult {
  creditScore: number;
  creditRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  hasBankruptcy: boolean;
  outstandingLoans: number;
  lastUpdated: string;
}

export interface IncomeVerificationResult {
  employmentVerified: boolean;
  verifiedAnnualIncome: number;
  debtToIncomeRatio: number;
  verificationDate: string;
}

export interface RiskAssessmentResult {
  riskScore: number;
  maxLoanAmount: number;
  recommendedInterestRate: number;
}

export interface LoanDecision {
  applicationId: string;
  customerId: string;
  approved: boolean;
  maxLoanAmount?: number;
  interestRate?: number;
  decisionDate: string;
  reason: string;
}

export interface NotificationResult {
  sent: boolean;
  channel: 'email' | 'sms' | 'both';
  timestamp: string;
}

export interface CustomerData {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  ssn: string;
  employmentStatus: string;
  annualIncome: number;
  monthlyExpenses: number;
  creditScore: number;
  hasBankruptcy: boolean;
  outstandingLoans: number;
}

export interface CustomerDataResult {
  success: boolean;
  customerData?: CustomerData;
  error?: string;
}

export interface LoanHistory {
  loanId: string;
  customerId: string;
  amount: number;
  term: number;
  purpose: string;
  status: 'Approved' | 'Rejected';
  applicationDate: string;
  decisionDate: string;
  interestRate?: number;
  reason?: string;
}

export interface LoanHistoryResult {
  success: boolean;
  loanHistory?: LoanHistory[];
  error?: string;
} 