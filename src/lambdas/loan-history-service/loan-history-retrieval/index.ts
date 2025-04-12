import { 
  LoanHistory,
  LoanHistoryResult
} from '../../../types/loan-types';
import { DynamoDB } from 'aws-sdk';

// Initialize DynamoDB client
const dynamoDB = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.LOAN_HISTORY_TABLE || 'LoanHistoryTable';

// Sample data for testing (will be replaced by DynamoDB)
const sampleLoanHistory: Record<string, LoanHistory[]> = {
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
  
  try {
    // Query DynamoDB for the customer's loan history
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'customerId = :customerId',
      ExpressionAttributeValues: {
        ':customerId': customerId
      }
    };
    
    const result = await dynamoDB.query(params).promise();
    
    // If no items found, return empty array
    if (!result.Items || result.Items.length === 0) {
      return {
        success: true,
        loanHistory: []
      };
    }
    
    // Return customer's loan history
    return {
      success: true,
      loanHistory: result.Items as LoanHistory[]
    };
  } catch (error) {
    console.error('Error retrieving loan history:', error);
    
    // For development/testing, fall back to sample data if DynamoDB fails
    if (sampleLoanHistory[customerId]) {
      console.log('Falling back to sample data');
      return {
        success: true,
        loanHistory: sampleLoanHistory[customerId]
      };
    }
    
    return {
      success: false,
      error: 'Failed to retrieve loan history'
    };
  }
}; 