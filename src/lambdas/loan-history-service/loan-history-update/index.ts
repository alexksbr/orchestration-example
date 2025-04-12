import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface LoanHistoryEvent {
  action: 'add' | 'update';
  customerId: string;
  loanData: {
    applicationId: string;
    amount: number;
    status: boolean | 'Approved' | 'Rejected';
    applicationDate?: string;
    decisionDate?: string;
  }
}

export const handler = async (event: LoanHistoryEvent) => {
  console.log('Loan History Update Input:', JSON.stringify(event, null, 2));
  try {
    const loanHistory = {
      loanId: `LOAN${Date.now()}`, // Generate a unique loan ID using timestamp
      customerId: event.customerId,
      applicationId: event.loanData.applicationId,
      amount: event.loanData.amount,
      status: typeof event.loanData.status === 'boolean' ? (event.loanData.status ? 'Approved' : 'Rejected') : event.loanData.status,
      applicationDate: event.loanData.applicationDate || new Date().toISOString(),
      decisionDate: event.loanData.decisionDate || new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: process.env.LOAN_HISTORY_TABLE,
      Item: loanHistory
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Loan history updated successfully',
        loanHistory
      })
    };
  } catch (error: unknown) {
    console.error('Error updating loan history:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error updating loan history',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    };
  }
}; 