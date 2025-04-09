import {
  LoanApplication,
  CreditCheckResult,
  IncomeVerificationResult,
  RiskAssessmentResult,
} from '../../types/loan-types';

interface RiskAssessmentEvent {
  application: LoanApplication;
  creditCheckResult: {
    Payload: CreditCheckResult;
  };
  incomeVerificationResult: {
    Payload: IncomeVerificationResult;
  };
}

export const handler = async (event: RiskAssessmentEvent): Promise<RiskAssessmentResult> => {
  // Log the event object for CloudWatch
  console.log('Risk Assessment Input:', JSON.stringify(event, null, 2));
  
  const { application, creditCheckResult, incomeVerificationResult } = event;
  const creditCheck = creditCheckResult.Payload;
  const incomeVerification = incomeVerificationResult.Payload;

  // Calculate debt-to-income ratio (monthly)
  const monthlyIncome = incomeVerification.verifiedAnnualIncome / 12;
  const debtToIncomeRatio = application.monthlyExpenses / monthlyIncome;

  // Calculate base risk score (0-100, lower is better)
  let riskScore = 50;

  // Credit score factor (can modify score by ±30)
  riskScore -= (creditCheck.creditScore - 600) / 10;

  // Debt-to-income factor (can modify score by ±20)
  riskScore += debtToIncomeRatio * 50;

  // Bankruptcy factor (adds 40 to risk if true)
  if (creditCheck.hasBankruptcy) {
    riskScore += 40;
  }

  // Outstanding loans factor (adds 5 per loan)
  riskScore += creditCheck.outstandingLoans * 5;

  // Employment verification factor (adds 10 if not verified)
  if (!incomeVerification.employmentVerified) {
    riskScore += 10;
  }

  // Clamp risk score between 0 and 100
  riskScore = Math.max(0, Math.min(100, riskScore));

  // Calculate max loan amount based on income and risk score
  const maxLoanAmount = calculateMaxLoanAmount(monthlyIncome, riskScore);

  // Calculate recommended interest rate based on risk score
  const recommendedInterestRate = calculateInterestRate(riskScore);

  return {
    riskScore,
    maxLoanAmount,
    recommendedInterestRate
  };
};

function calculateMaxLoanAmount(monthlyIncome: number, riskScore: number): number {
  // Base: 36 months of income
  const baseAmount = monthlyIncome * 36;
  
  // Adjust based on risk score (0-100% of base amount)
  const riskFactor = (100 - riskScore) / 100;
  
  return Math.round(baseAmount * riskFactor);
}

function calculateInterestRate(riskScore: number): number {
  // Base rate of 5%
  const baseRate = 5;
  
  // Add up to 15% based on risk score
  const riskPremium = (riskScore / 100) * 15;
  
  return Number((baseRate + riskPremium).toFixed(2));
} 