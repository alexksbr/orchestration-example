import { LoanApplication, IncomeVerificationResult } from '../../types/loan-types';

export const handler = async (event: LoanApplication): Promise<IncomeVerificationResult> => {
  // In a real implementation, this would call employment verification services
  // and possibly request bank statements or tax returns
  const verifyIncome = (application: LoanApplication): IncomeVerificationResult => {
    // Simulate verification process with some randomness
    const hash = application.customerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Simulate slight variations in verified income
    const varianceFactor = 0.9 + (hash % 20) / 100; // ±10% variance
    const verifiedIncome = Math.round(application.annualIncome * varianceFactor);
    
    // 90% chance of employment verification success
    const employmentVerified = hash % 10 !== 0;

    return {
      isVerified: employmentVerified,
      verifiedAnnualIncome: verifiedIncome,
      employmentVerified
    };
  };

  try {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 700));
    return verifyIncome(event);
  } catch (error) {
    console.error('Error verifying income:', error);
    throw new Error('Failed to verify income');
  }
}; 