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
6. **Notification** - Sends the result to the applicant

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
- Replacing the in-memory customer data service with a DynamoDB-backed service

## License

This project is licensed under the MIT License - see the LICENSE file for details.
