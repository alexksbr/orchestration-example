import { 
  LoanApplication, 
  RiskAssessmentResult, 
  LoanDecision 
} from '../../types/loan-types';

interface LoanDecisionEvent {
  application: LoanApplication;
  riskAssessmentResult: {
    Payload: RiskAssessmentResult
  };
}

export const handler = async (event: LoanDecisionEvent): Promise<LoanDecision> => {
  // Log the event object for CloudWatch
  console.log('Loan Decision Input:', JSON.stringify(event, null, 2));
  const { application, riskAssessmentResult } = event;
  const riskAssessment = riskAssessmentResult.Payload;

  // Automatic rejection criteria
  if (riskAssessment.riskScore > 80) {
    return {
      approved: false,
      reason: 'Risk score too high'
    };
  }

  if (application.amount > riskAssessment.maxLoanAmount) {
    return {
      approved: false,
      maxAmount: riskAssessment.maxLoanAmount,
      reason: 'Requested amount exceeds maximum approved amount'
    };
  }

  // If we get here, the loan is approved
  return {
    approved: true,
    maxAmount: riskAssessment.maxLoanAmount,
    interestRate: riskAssessment.recommendedInterestRate
  };
}; 