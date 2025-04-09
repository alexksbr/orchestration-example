import { 
  CreditCheckResult,
  CustomerData
} from '../../types/loan-types';

interface CreditCheckEvent {
  customerId: string;
  customerData?: CustomerData;
}

export const handler = async (event: CreditCheckEvent): Promise<CreditCheckResult> => {
  // Log the event object for CloudWatch
  console.log('Credit Check Input:', JSON.stringify(event, null, 2));
  
  const { customerId, customerData } = event;
  
  // If customer data is not provided, we'll need to fetch it from the customer data service
  // This would be handled by the Step Functions workflow
  
  if (!customerData) {
    throw new Error('Customer data is required for credit check');
  }
  
  // In a real implementation, this would call an external credit bureau API
  // For this example, we'll use the customer data directly
  
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Use the customer's credit score from the customer data
  const creditScore = customerData.creditScore;
  
  // Determine credit rating based on score
  let creditRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  if (creditScore >= 750) {
    creditRating = 'Excellent';
  } else if (creditScore >= 700) {
    creditRating = 'Good';
  } else if (creditScore >= 650) {
    creditRating = 'Fair';
  } else {
    creditRating = 'Poor';
  }
  
  return {
    creditScore,
    creditRating,
    hasBankruptcy: customerData.hasBankruptcy,
    outstandingLoans: customerData.outstandingLoans,
    lastUpdated: new Date().toISOString()
  };
}; 