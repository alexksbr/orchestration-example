import { 
  LoanApplication, 
  ValidationResult,
  CustomerData
} from '../../types/loan-types';

interface ValidationEvent {
  applicationId: string;
  customerId: string;
  amount: number;
  term: number;
  purpose: string;
  customerData?: CustomerData;
}

export const handler = async (event: ValidationEvent): Promise<ValidationResult> => {
  // Log the event object for CloudWatch
  console.log('Validation Input:', JSON.stringify(event, null, 2));
  
  const { applicationId, customerId, amount, term, purpose, customerData } = event;
  
  // If customer data is not provided, we'll need to fetch it from the customer data service
  // This would be handled by the Step Functions workflow
  
  const errors: string[] = [];
  
  // Validate application ID
  if (!applicationId || applicationId.trim() === '') {
    errors.push('Application ID is required');
  }
  
  // Validate customer ID
  if (!customerId || customerId.trim() === '') {
    errors.push('Customer ID is required');
  }
  
  // Validate amount
  if (!amount || amount <= 0) {
    errors.push('Loan amount must be greater than zero');
  } else if (amount > 1000000) {
    errors.push('Loan amount exceeds maximum limit of $1,000,000');
  }
  
  // Validate term
  if (!term || term <= 0) {
    errors.push('Loan term must be greater than zero');
  } else if (term > 360) {
    errors.push('Loan term cannot exceed 360 months (30 years)');
  }
  
  // Validate purpose
  if (!purpose || purpose.trim() === '') {
    errors.push('Loan purpose is required');
  }
  
  // If we have customer data, we can perform additional validations
  if (customerData) {
    // Validate that the customer exists
    if (!customerData.customerId) {
      errors.push('Customer data is invalid');
    }
    
    // Validate that the customer's income is sufficient for the loan
    const monthlyPayment = calculateMonthlyPayment(amount, term, 0.05); // Assuming 5% interest rate for validation
    const monthlyIncome = customerData.annualIncome / 12;
    const debtToIncomeRatio = (monthlyPayment + customerData.monthlyExpenses) / monthlyIncome;
    
    if (debtToIncomeRatio > 0.43) {
      errors.push('Debt-to-income ratio exceeds maximum allowed (43%)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to calculate monthly payment
function calculateMonthlyPayment(principal: number, term: number, annualInterestRate: number): number {
  const monthlyInterestRate = annualInterestRate / 12;
  const numberOfPayments = term;
  
  if (monthlyInterestRate === 0) {
    return principal / numberOfPayments;
  }
  
  return (
    principal *
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
  );
} 