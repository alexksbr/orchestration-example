import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Generate a random date within the last 2 years
function getRandomDate(): string {
  const now = new Date();
  const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
  const randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
  return new Date(randomTime).toISOString();
}

// Generate a random loan amount between 1000 and 100000
function getRandomAmount(): number {
  return Math.floor(1000 + Math.random() * 99000);
}

// Generate a random loan term between 12 and 60 months
function getRandomTerm(): number {
  return Math.floor(12 + Math.random() * 48);
}

// Generate a random loan purpose
function getRandomPurpose(): string {
  const purposes = ['Home Improvement', 'Debt Consolidation', 'Education', 'Medical Expenses', 'Business', 'Vacation', 'Wedding', 'Car Purchase'];
  return purposes[Math.floor(Math.random() * purposes.length)];
}

// Generate a random loan status
function getRandomStatus(): 'Approved' | 'Rejected' {
  return Math.random() > 0.3 ? 'Approved' : 'Rejected';
}

// Generate a random reason for rejection
function getRandomRejectionReason(): string {
  const reasons = [
    'Insufficient credit score',
    'High debt-to-income ratio',
    'Insufficient income',
    'Recent bankruptcy',
    'Too many open accounts',
    'Recent late payments',
    'Insufficient employment history'
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

// Generate a random approval reason
function getRandomApprovalReason(): string {
  const reasons = [
    'Good credit score',
    'Low debt-to-income ratio',
    'Sufficient income',
    'Good payment history',
    'Stable employment',
    'Reasonable loan amount',
    'Good collateral'
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

// Generate dummy loan history data
function generateDummyLoanHistory(customerId: string, count: number): any[] {
  const loanHistory = [];
  
  for (let i = 0; i < count; i++) {
    const loanId = `loan-${customerId}-${i + 1}`;
    const status = getRandomStatus();
    const applicationDate = getRandomDate();
    const decisionDate = new Date(new Date(applicationDate).getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    
    loanHistory.push({
      customerId,
      loanId,
      amount: getRandomAmount(),
      term: getRandomTerm(),
      purpose: getRandomPurpose(),
      status,
      applicationDate,
      decisionDate,
      reason: status === 'Approved' ? getRandomApprovalReason() : getRandomRejectionReason()
    });
  }
  
  return loanHistory;
}

export const handler = async (): Promise<any> => {
  try {
    const tableName = process.env.LOAN_HISTORY_TABLE;
    if (!tableName) {
      throw new Error('LOAN_HISTORY_TABLE environment variable is not set');
    }
    
    console.log(`Populating table ${tableName} with dummy data...`);
    
    // Generate dummy data for 5 customers with 3-7 loans each
    const customers = ['customer-001', 'customer-002', 'customer-003', 'customer-004', 'customer-005'];
    const allLoans = [];
    
    for (const customerId of customers) {
      const loanCount = Math.floor(3 + Math.random() * 5); // 3-7 loans per customer
      const customerLoans = generateDummyLoanHistory(customerId, loanCount);
      allLoans.push(...customerLoans);
    }
    
    // Insert all loans into DynamoDB
    const putPromises = allLoans.map(loan => 
      docClient.send(new PutCommand({
        TableName: tableName,
        Item: loan
      }))
    );
    
    await Promise.all(putPromises);
    
    console.log(`Successfully populated table with ${allLoans.length} dummy loan records`);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully populated table with ${allLoans.length} dummy loan records`,
        customerCount: customers.length,
        loanCount: allLoans.length
      })
    };
  } catch (error) {
    console.error('Error populating table:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error populating table with dummy data',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    };
  }
}; 