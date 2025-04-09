import { LoanApplication, CreditCheckResult } from '../../types/loan-types';

export const handler = async (event: LoanApplication): Promise<CreditCheckResult> => {
  // In a real implementation, this would call a credit bureau API
  // This is a simplified simulation
  const simulateCreditCheck = (customerId: string): CreditCheckResult => {
    // Generate a deterministic but seemingly random score based on customerId
    const hash = customerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const creditScore = 300 + (hash % 550); // Score between 300 and 850
    
    return {
      creditScore,
      hasBankruptcy: hash % 20 === 0, // 5% chance of bankruptcy
      outstandingLoans: hash % 5 // 0-4 outstanding loans
    };
  };

  try {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 500));
    return simulateCreditCheck(event.customerId);
  } catch (error) {
    console.error('Error performing credit check:', error);
    throw new Error('Failed to perform credit check');
  }
}; 