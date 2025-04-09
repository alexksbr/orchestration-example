import { 
  IncomeVerificationResult,
  CustomerData
} from '../../types/loan-types';

interface IncomeVerificationEvent {
  customerId: string;
  customerData?: CustomerData;
}

export const handler = async (event: IncomeVerificationEvent): Promise<IncomeVerificationResult> => {
  // Log the event object for CloudWatch
  console.log('Income Verification Input:', JSON.stringify(event, null, 2));
  
  const { customerId, customerData } = event;
  
  // If customer data is not provided, we'll need to fetch it from the customer data service
  // This would be handled by the Step Functions workflow
  
  if (!customerData) {
    throw new Error('Customer data is required for income verification');
  }
  
  // In a real implementation, this would call an external employment verification service
  // For this example, we'll use the customer data directly
  
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Simulate employment verification (90% success rate)
  const employmentVerified = Math.random() < 0.9;
  
  // Use the customer's income data
  const verifiedAnnualIncome = customerData.annualIncome;
  
  // Calculate debt-to-income ratio
  const monthlyIncome = verifiedAnnualIncome / 12;
  const debtToIncomeRatio = customerData.monthlyExpenses / monthlyIncome;
  
  return {
    employmentVerified,
    verifiedAnnualIncome,
    debtToIncomeRatio,
    verificationDate: new Date().toISOString()
  };
}; 