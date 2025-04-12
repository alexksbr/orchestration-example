import { 
  LoanHistory,
  LoanHistoryResult
} from '../../types/loan-types';

// In-memory database (in a real implementation, this would be a DynamoDB table)
const loanHistoryDatabase: Record<string, LoanHistory[]> = {
  'CUST456': [
    {
      loanId: 'LOAN001',
      customerId: 'CUST456',
      amount: 25000,
      term: 24,
      purpose: 'Car Purchase',
      status: 'Approved',
      applicationDate: '2023-01-15',
      decisionDate: '2023-01-16',
      interestRate: 4.5
    }
  ],
  'CUST789': [
    {
      loanId: 'LOAN002',
      customerId: 'CUST789',
      amount: 150000,
      term: 360,
      purpose: 'Home Purchase',
      status: 'Approved',
      applicationDate: '2022-06-10',
      decisionDate: '2022-06-12',
      interestRate: 3.75
    },
    {
      loanId: 'LOAN003',
      customerId: 'CUST789',
      amount: 10000,
      term: 12,
      purpose: 'Home Improvement',
      status: 'Rejected',
      applicationDate: '2023-03-05',
      decisionDate: '2023-03-06',
      reason: 'Insufficient income'
    }
  ]
};

interface LoanHistoryRetrievalEvent {
  customerId: string;
}

export const handler = async (event: LoanHistoryRetrievalEvent): Promise<LoanHistoryResult> => {
  console.log('Loan History Retrieval Input:', JSON.stringify(event, null, 2));
  
  const { customerId } = event;
  
  // Check if customer exists in the database
  if (!loanHistoryDatabase[customerId]) {
    return {
      success: true,
      loanHistory: []
    };
  }
  
  // Return customer's loan history
  return {
    success: true,
    loanHistory: loanHistoryDatabase[customerId]
  };
}; 