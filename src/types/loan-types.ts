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
  hasBankruptcy: boolean;
  outstandingLoans: number;
}

export interface IncomeVerificationResult {
  isVerified: boolean;
  verifiedAnnualIncome: number;
  employmentVerified: boolean;
}

export interface RiskAssessmentResult {
  riskScore: number;
  maxLoanAmount: number;
  recommendedInterestRate: number;
}

export interface LoanDecision {
  approved: boolean;
  maxAmount?: number;
  interestRate?: number;
  reason?: string;
}

export interface NotificationResult {
  sent: boolean;
  channel: 'email' | 'sms' | 'both';
  timestamp: string;
} 