# AWS Step Functions Loan Processing Workflow

This project demonstrates a loan processing workflow implemented using AWS Step Functions and Lambda functions. It showcases how to orchestrate a complex business process with multiple steps, parallel processing, and error handling.

## Architecture

The workflow simulates a loan application process with the following steps:

1. **Customer Data Retrieval** - Fetches customer data from a stateful microservice
2. **Application Validation** - Validates the loan application data
3. **Parallel Processing**:
   - **Credit Check** - Checks the applicant's credit score and history
   - **Income Verification** - Verifies the applicant's income and employment
4. **Risk Assessment** - Evaluates the overall risk based on credit and income data
5. **Loan Decision** - Makes the final approval decision
6. **Loan History Update** - Updates the customer's loan history
7. **Notification** - Sends the result to the applicant

## Project Structure

```
.
├── bin/                      # CDK app entry point
├── lib/                      # CDK stack definition
├── src/                      # Source code
│   ├── lambdas/              # Lambda function implementations
│   │   ├── customer-data/    # Customer data microservice
│   │   ├── validation/       # Application validation
│   │   ├── credit-check/     # Credit check
│   │   ├── income-verification/ # Income verification
│   │   ├── risk-assessment/  # Risk assessment
│   │   ├── loan-decision/    # Loan decision
│   │   ├── loan-history-service/ # Loan history microservice
│   │   │   ├── loan-history-update/ # Update loan history
│   │   │   ├── loan-history-retrieval/ # Retrieve loan history
│   │   │   └── populate-table/ # Populate DynamoDB with dummy data
│   │   └── notification/     # Notification
│   └── types/                # Shared type definitions
├── test/                     # Test files
├── cdk.json                  # CDK configuration
├── package.json              # Project dependencies
└── tsconfig.json             # TypeScript configuration
```

## Prerequisites

- Node.js (v14 or later)
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed globally (`npm install -g aws-cdk`)

## Setup and Deployment

1. Install dependencies:
   ```
   npm install
   ```

2. Build the project:
   ```
   npm run build
   ```

3. Deploy the stack to AWS:
   ```
   cdk deploy
   ```

## Testing the Workflow

After deployment, you can test the workflow in the AWS Step Functions console:

1. Navigate to the Step Functions console
2. Find your state machine (named `LoanProcessingStateMachine`)
3. Click "Start execution"
4. Use the following sample input:

```json
{
  "applicationId": "APP123",
  "customerId": "CUST456",
  "amount": 50000,
  "term": 36,
  "purpose": "Home Improvement"
}
```

5. Click "Start execution" to run the workflow

## Workflow Details

### Customer Data Service
- Acts as a stateful microservice storing customer information
- Provides customer data to other services in the workflow
- In a real implementation, this would be a DynamoDB-backed service
- Currently uses an in-memory database for demonstration purposes

### Application Validation
- Validates the loan application data
- Uses customer data to perform additional validations
- Checks if the amount is within acceptable limits
- Returns validation result with any errors

### Credit Check
- Uses customer data to check the applicant's credit score
- Evaluates bankruptcy history and outstanding loans
- Returns credit check results

### Income Verification
- Uses customer data to verify the applicant's income and employment status
- Calculates debt-to-income ratio
- Returns income verification results

### Risk Assessment
- Evaluates overall risk based on credit and income data
- Calculates risk score (0-100, lower is better)
- Determines maximum loan amount and recommended interest rate

### Loan Decision
- Makes the final approval decision based on risk assessment
- Sets loan terms if approved
- Provides rejection reason if declined

### Loan History Service
- Acts as a stateful microservice storing loan application history
- Records all loan applications and their outcomes
- Provides historical data for future loan decisions
- Implemented as a separate CDK stack for better modularity
- Uses DynamoDB for persistent storage
- Includes two Lambda functions:
  - **Loan History Update**: Adds new loan records to the history
  - **Loan History Retrieval**: Retrieves loan history for a customer
- Automatically populated with dummy data upon deployment
  - Creates 5 sample customers with 3-7 loans each
  - Includes both approved and rejected loans
  - Provides realistic loan amounts, terms, and purposes
  - Generates appropriate approval/rejection reasons

### Notification
- Sends the result to the applicant
- Simulates email/SMS notification

## Error Handling

The workflow includes error handling for:
- Invalid applications
- Processing errors
- Notification failures

## Customization

You can customize the workflow by:
- Modifying the Lambda functions to implement your business logic
- Adjusting the Step Functions workflow definition
- Adding additional steps or parallel branches
- Implementing actual notification mechanisms
- Replacing the in-memory services with DynamoDB-backed services

## Loan History Service Details

The Loan History Service is implemented as a separate CDK stack for better modularity and reusability. It consists of:

1. **DynamoDB Table**:
   - Partition key: `customerId` (string)
   - Sort key: `loanId` (string)
   - Stores loan application history with details like amount, term, purpose, status, etc.

2. **Lambda Functions**:
   - **Loan History Update**: Adds new loan records to the history
   - **Loan History Retrieval**: Retrieves loan history for a customer
   - **Populate Table**: Automatically populates the DynamoDB table with dummy data upon deployment

3. **Custom Resource**:
   - Runs the populate table Lambda function during stack deployment
   - Ensures the DynamoDB table is populated with realistic test data

### Dummy Data Population

The Loan History Service automatically populates the DynamoDB table with dummy data upon deployment. This feature:

- Creates 5 sample customers with 3-7 loans each
- Generates realistic loan data including:
  - Random loan amounts between $1,000 and $100,000
  - Random loan terms between 12 and 60 months
  - Various loan purposes (Home Improvement, Debt Consolidation, Education, etc.)
  - Both approved and rejected loans (70% approved, 30% rejected)
  - Appropriate approval/rejection reasons
  - Realistic application and decision dates within the last 2 years

This allows you to immediately start testing the loan history retrieval functionality without having to manually insert test data.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
