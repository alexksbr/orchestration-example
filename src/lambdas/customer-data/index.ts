import { 
  CustomerData,
  CustomerDataResult
} from '../../types/loan-types';

// In-memory database (in a real implementation, this would be a DynamoDB table)
const customerDatabase: Record<string, CustomerData> = {
  'CUST456': {
    customerId: 'CUST456',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    address: '123 Main St, Anytown, USA',
    dateOfBirth: '1980-05-15',
    ssn: 'XXX-XX-1234', // In a real implementation, this would be encrypted
    employmentStatus: 'Full-time',
    annualIncome: 120000,
    monthlyExpenses: 3000,
    creditScore: 720,
    hasBankruptcy: false,
    outstandingLoans: 1
  },
  'CUST789': {
    customerId: 'CUST789',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-987-6543',
    address: '456 Oak Ave, Somewhere, USA',
    dateOfBirth: '1975-10-22',
    ssn: 'XXX-XX-5678', // In a real implementation, this would be encrypted
    employmentStatus: 'Self-employed',
    annualIncome: 95000,
    monthlyExpenses: 2500,
    creditScore: 680,
    hasBankruptcy: false,
    outstandingLoans: 2
  }
};

interface CustomerDataEvent {
  customerId: string;
  action: 'get' | 'update';
  data?: Partial<CustomerData>;
}

export const handler = async (event: CustomerDataEvent): Promise<CustomerDataResult> => {
  console.log('Customer Data Service Input:', JSON.stringify(event, null, 2));
  
  const { customerId, action, data } = event;
  
  // Check if customer exists
  if (!customerDatabase[customerId]) {
    return {
      success: false,
      error: `Customer with ID ${customerId} not found`
    };
  }
  
  // Handle different actions
  if (action === 'get') {
    // Return customer data
    return {
      success: true,
      customerData: customerDatabase[customerId]
    };
  } else if (action === 'update' && data) {
    // Update customer data
    customerDatabase[customerId] = {
      ...customerDatabase[customerId],
      ...data
    };
    
    return {
      success: true,
      customerData: customerDatabase[customerId]
    };
  } else {
    return {
      success: false,
      error: 'Invalid action or missing data for update'
    };
  }
}; 