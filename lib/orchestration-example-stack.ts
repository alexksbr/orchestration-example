import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class OrchestrationExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // Create DynamoDB table for loan history
    const loanHistoryTable = new dynamodb.Table(this, 'LoanHistoryTable', {
      partitionKey: { name: 'customerId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'loanId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development purposes, in production you might want to use RETAIN
    });

    // Lambda Functions
    const customerDataFunction = new nodejs.NodejsFunction(this, 'CustomerDataFunction', {
      entry: path.join(__dirname, '../src/lambdas/customer-data/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
    });

    const validationFunction = new nodejs.NodejsFunction(this, 'ValidationFunction', {
      entry: path.join(__dirname, '../src/lambdas/validation/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
    });

    const creditCheckFunction = new nodejs.NodejsFunction(this, 'CreditCheckFunction', {
      entry: path.join(__dirname, '../src/lambdas/credit-check/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
    });

    const incomeVerificationFunction = new nodejs.NodejsFunction(this, 'IncomeVerificationFunction', {
      entry: path.join(__dirname, '../src/lambdas/income-verification/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
    });

    const riskAssessmentFunction = new nodejs.NodejsFunction(this, 'RiskAssessmentFunction', {
      entry: path.join(__dirname, '../src/lambdas/risk-assessment/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
    });

    const loanDecisionFunction = new nodejs.NodejsFunction(this, 'LoanDecisionFunction', {
      entry: path.join(__dirname, '../src/lambdas/loan-decision/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
    });

    // Loan History Update Lambda
    const loanHistoryUpdateLambda = new nodejs.NodejsFunction(this, 'LoanHistoryUpdateFunction', {
      entry: path.join(__dirname, '../src/lambdas/loan-history-service/loan-history-update/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        LOAN_HISTORY_TABLE: loanHistoryTable.tableName,
      },
    });

    // Grant DynamoDB permissions to the update Lambda
    loanHistoryTable.grantWriteData(loanHistoryUpdateLambda);

    // Loan History Retrieval Lambda
    const loanHistoryRetrievalLambda = new nodejs.NodejsFunction(this, 'LoanHistoryRetrievalFunction', {
      entry: path.join(__dirname, '../src/lambdas/loan-history-service/loan-history-retrieval/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        LOAN_HISTORY_TABLE: loanHistoryTable.tableName,
      },
    });

    // Grant DynamoDB permissions to the retrieval Lambda
    loanHistoryTable.grantReadData(loanHistoryRetrievalLambda);

    const notificationFunction = new nodejs.NodejsFunction(this, 'NotificationFunction', {
      entry: path.join(__dirname, '../src/lambdas/notification/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
    });

    // Step Functions Definition
    // First, fetch customer data
    const fetchCustomerData = new tasks.LambdaInvoke(this, 'Fetch Customer Data', {
      lambdaFunction: customerDataFunction,
      resultPath: '$.customerDataResult',
      payload: sfn.TaskInput.fromObject({
        customerId: sfn.JsonPath.stringAt('$.customerId'),
        action: 'get'
      }),
    });

    // Extract customer data from the Lambda response
    const extractCustomerData = new sfn.Pass(this, 'Extract Customer Data', {
      parameters: {
        'applicationId': sfn.JsonPath.stringAt('$.applicationId'),
        'customerId': sfn.JsonPath.stringAt('$.customerId'),
        'amount': sfn.JsonPath.numberAt('$.amount'),
        'term': sfn.JsonPath.numberAt('$.term'),
        'purpose': sfn.JsonPath.stringAt('$.purpose'),
        'customerData': sfn.JsonPath.stringAt('$.customerDataResult.Payload.customerData')
      }
    });

    const validateApplication = new tasks.LambdaInvoke(this, 'Validate Application', {
      lambdaFunction: validationFunction,
      resultPath: '$.validationResult',
      inputPath: '$',
    });

    // Prepare data for credit check
    const prepareCreditCheck = new sfn.Pass(this, 'Prepare Credit Check', {
      parameters: {
        'customerId': sfn.JsonPath.stringAt('$.customerId'),
        'amount': sfn.JsonPath.numberAt('$.amount'),
        'term': sfn.JsonPath.numberAt('$.term'),
        'purpose': sfn.JsonPath.stringAt('$.purpose'),
        'applicationId': sfn.JsonPath.stringAt('$.applicationId'),
        'customerData': sfn.JsonPath.stringAt('$.customerData')
      }
    });

    const checkCredit = new tasks.LambdaInvoke(this, 'Check Credit', {
      lambdaFunction: creditCheckFunction,
      resultPath: '$.creditCheckResult',
      inputPath: '$',
    });

    // Prepare data for income verification
    const prepareIncomeVerification = new sfn.Pass(this, 'Prepare Income Verification', {
      parameters: {
        'customerId': sfn.JsonPath.stringAt('$.customerId'),
        'amount': sfn.JsonPath.numberAt('$.amount'),
        'term': sfn.JsonPath.numberAt('$.term'),
        'purpose': sfn.JsonPath.stringAt('$.purpose'),
        'applicationId': sfn.JsonPath.stringAt('$.applicationId'),
        'customerData': sfn.JsonPath.stringAt('$.customerData')
      }
    });

    const verifyIncome = new tasks.LambdaInvoke(this, 'Verify Income', {
      lambdaFunction: incomeVerificationFunction,
      resultPath: '$.incomeVerificationResult',
      inputPath: '$',
    });

    // Create a Pass state to prepare data for risk assessment
    const prepareRiskAssessment = new sfn.Pass(this, 'Prepare Risk Assessment', {
      parameters: {
        'application': sfn.JsonPath.stringAt('$[0]'),
        'creditCheckResult': sfn.JsonPath.stringAt('$[0].creditCheckResult'),
        'incomeVerificationResult': sfn.JsonPath.stringAt('$[1].incomeVerificationResult')
      }
    });

    const assessRisk = new tasks.LambdaInvoke(this, 'Assess Risk', {
      lambdaFunction: riskAssessmentFunction,
      resultPath: '$.riskAssessmentResult',
      inputPath: '$',
    });

    const makeLoanDecision = new tasks.LambdaInvoke(this, 'Make Loan Decision', {
      lambdaFunction: loanDecisionFunction,
      resultPath: '$.loanDecision',
      inputPath: '$',
    });

    // Add loan history retrieval task to the workflow
    const retrieveLoanHistory = new tasks.LambdaInvoke(this, 'Retrieve Loan History', {
      lambdaFunction: loanHistoryRetrievalLambda,
      resultPath: '$.loanHistoryResult',
      payload: sfn.TaskInput.fromObject({
        customerId: sfn.JsonPath.stringAt('$.application.customerId')
      })
    });

    // Update loan history
    const updateLoanHistory = new tasks.LambdaInvoke(this, 'Update Loan History', {
      lambdaFunction: loanHistoryUpdateLambda,
      resultPath: '$.loanHistoryUpdateResult',
      payload: sfn.TaskInput.fromObject({
        customerId: sfn.JsonPath.stringAt('$.application.customerId'),
        action: 'add',
        loanData: {
          loanId: sfn.JsonPath.stringAt('$.application.applicationId'),
          amount: sfn.JsonPath.numberAt('$.application.amount'),
          term: sfn.JsonPath.numberAt('$.application.term'),
          purpose: sfn.JsonPath.stringAt('$.application.purpose'),
          status: sfn.JsonPath.stringAt('$.loanDecision.Payload.approved'),
          decisionDate: sfn.JsonPath.stringAt('$.loanDecision.Payload.decisionDate'),
          reason: sfn.JsonPath.stringAt('$.loanDecision.Payload.reason')
        }
      })
    });

    const sendNotification = new tasks.LambdaInvoke(this, 'Send Notification', {
      lambdaFunction: notificationFunction,
      resultPath: '$.notificationResult',
      inputPath: '$',
    });

    // Error handling
    const notifyError = new tasks.LambdaInvoke(this, 'Notify Error', {
      lambdaFunction: notificationFunction,
      resultPath: '$.notificationResult',
      payload: sfn.TaskInput.fromObject({
        application: sfn.JsonPath.stringAt('$'),
        decision: {
          approved: false,
          reason: 'Application processing error occurred'
        }
      }),
    });

    // Workflow Definition
    const definition = fetchCustomerData
      .next(extractCustomerData)
      .next(validateApplication)
      .next(new sfn.Choice(this, 'Is Application Valid?')
        .when(sfn.Condition.booleanEquals('$.validationResult.Payload.isValid', true), 
          new sfn.Parallel(this, 'Parallel Processing')
            .branch(
              prepareCreditCheck
                .next(checkCredit)
            )
            .branch(
              prepareIncomeVerification
                .next(verifyIncome)
            )
            .next(prepareRiskAssessment)
            .next(assessRisk)
            .next(retrieveLoanHistory)
            .next(makeLoanDecision)
            .next(updateLoanHistory)
            .next(sendNotification))
        .otherwise(
          new tasks.LambdaInvoke(this, 'Notify Validation Failure', {
            lambdaFunction: notificationFunction,
            resultPath: '$.notificationResult',
            payload: sfn.TaskInput.fromObject({
              application: sfn.JsonPath.stringAt('$'),
              decision: {
                approved: false,
                reason: sfn.JsonPath.stringAt('$.validationResult.Payload.errors[0]')
              }
            }),
          })
        )
      );

    // Create State Machine
    const stateMachine = new sfn.StateMachine(this, 'LoanProcessingStateMachine', {
      definition,
      timeout: cdk.Duration.minutes(5),
      tracingEnabled: true,
      stateMachineType: sfn.StateMachineType.STANDARD,
    });

    // Add error handling to State Machine
    stateMachine.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
      actions: ['lambda:InvokeFunction'],
      resources: [notificationFunction.functionArn],
    }));

    // Output the state machine ARN
    new cdk.CfnOutput(this, 'StateMachineArn', {
      value: stateMachine.stateMachineArn,
      description: 'State machine ARN',
    });
  }
}
