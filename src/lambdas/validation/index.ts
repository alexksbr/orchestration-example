import { LoanApplication, ValidationResult } from '../../types/loan-types';

export const handler = async (event: LoanApplication): Promise<ValidationResult> => {
  const errors: string[] = [];

  // Log the event object
  console.log('Validating loan application:', event);

  // Check required fields
  if (!event.customerId) errors.push('Customer ID is required');
  if (!event.amount || event.amount <= 0) errors.push('Valid loan amount is required');
  if (!event.term || event.term < 1) errors.push('Valid loan term is required');
  if (!event.purpose) errors.push('Loan purpose is required');
  if (!event.employmentStatus) errors.push('Employment status is required');
  if (!event.annualIncome || event.annualIncome <= 0) errors.push('Valid annual income is required');
  if (!event.monthlyExpenses || event.monthlyExpenses < 0) errors.push('Valid monthly expenses is required');

  // Business rules validation
  if (event.amount > 1000000) errors.push('Loan amount exceeds maximum limit of $1,000,000');
  if (event.term > 360) errors.push('Loan term cannot exceed 360 months');
  if (event.monthlyExpenses > event.annualIncome / 12) {
    errors.push('Monthly expenses cannot exceed monthly income');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}; 