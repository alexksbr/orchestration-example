import { 
  LoanApplication, 
  RiskAssessmentResult, 
  LoanDecision,
  LoanHistory
} from '../../types/loan-types';

interface LoanDecisionEvent {
  application: LoanApplication;
  riskAssessmentResult: RiskAssessmentResult;
  loanHistoryResult: {
    Payload: {
      success: boolean;
      loanHistory: LoanHistory[];
    }
  };
}

export const handler = async (event: LoanDecisionEvent): Promise<LoanDecision> => {
  console.log('Loan Decision Input:', JSON.stringify(event, null, 2));
  
  const { application, riskAssessmentResult, loanHistoryResult } = event;
  const loanHistory = loanHistoryResult.Payload.loanHistory || [];

  // Calculate decision based on risk assessment and loan history
  const riskScore = riskAssessmentResult.riskScore;
  const hasDefaultedLoans = loanHistory.some((loan: LoanHistory) => loan.status === 'Rejected');
  const hasSuccessfulLoans = loanHistory.some((loan: LoanHistory) => loan.status === 'Approved');
  
  // Determine approval status
  let approved = false;
  let reason = '';
  let interestRate = 0;
  let maxLoanAmount = 0;

  if (riskScore <= 50) {
    // Low risk - approve with favorable terms
    approved = true;
    reason = 'Low risk profile';
    interestRate = 5.0;
    maxLoanAmount = application.amount * 1.2; // Allow 20% more than requested
  } else if (riskScore <= 70 && !hasDefaultedLoans) {
    // Medium risk - approve with standard terms
    approved = true;
    reason = 'Medium risk profile';
    interestRate = 8.0;
    maxLoanAmount = application.amount;
  } else if (riskScore <= 85 && hasSuccessfulLoans && !hasDefaultedLoans) {
    // Higher risk but has good history - approve with higher interest
    approved = true;
    reason = 'Higher risk but good history';
    interestRate = 12.0;
    maxLoanAmount = application.amount * 0.8; // Reduce amount by 20%
  } else {
    // High risk or poor history - reject
    approved = false;
    reason = 'High risk profile or poor loan history';
  }

  return {
    applicationId: application.applicationId,
    customerId: application.customerId,
    approved,
    interestRate: approved ? interestRate : undefined,
    maxLoanAmount: approved ? maxLoanAmount : undefined,
    decisionDate: new Date().toISOString().split('T')[0],
    reason
  };
}; 