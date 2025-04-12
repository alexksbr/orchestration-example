import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { Construct } from 'constructs';

export class LoanHistoryServiceStack extends cdk.Stack {
  public readonly loanHistoryTable: dynamodb.Table;
  public readonly loanHistoryUpdateLambda: lambda.Function;
  public readonly loanHistoryRetrievalLambda: lambda.Function;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table for loan history
    this.loanHistoryTable = new dynamodb.Table(this, 'LoanHistoryTable', {
      partitionKey: { name: 'customerId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'loanId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development purposes, in production you might want to use RETAIN
    });

    // Loan History Update Lambda
    this.loanHistoryUpdateLambda = new nodejs.NodejsFunction(this, 'LoanHistoryUpdateFunction', {
      entry: path.join(__dirname, '../src/lambdas/loan-history-service/loan-history-update/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        LOAN_HISTORY_TABLE: this.loanHistoryTable.tableName,
      },
    });

    // Grant DynamoDB permissions to the update Lambda
    this.loanHistoryTable.grantWriteData(this.loanHistoryUpdateLambda);

    // Loan History Retrieval Lambda
    this.loanHistoryRetrievalLambda = new nodejs.NodejsFunction(this, 'LoanHistoryRetrievalFunction', {
      entry: path.join(__dirname, '../src/lambdas/loan-history-service/loan-history-retrieval/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        LOAN_HISTORY_TABLE: this.loanHistoryTable.tableName,
      },
    });

    // Grant DynamoDB permissions to the retrieval Lambda
    this.loanHistoryTable.grantReadData(this.loanHistoryRetrievalLambda);

    // Output the table name and Lambda ARNs
    new cdk.CfnOutput(this, 'LoanHistoryTableName', {
      value: this.loanHistoryTable.tableName,
      description: 'Loan History DynamoDB Table Name',
    });

    new cdk.CfnOutput(this, 'LoanHistoryUpdateLambdaArn', {
      value: this.loanHistoryUpdateLambda.functionArn,
      description: 'Loan History Update Lambda ARN',
    });

    new cdk.CfnOutput(this, 'LoanHistoryRetrievalLambdaArn', {
      value: this.loanHistoryRetrievalLambda.functionArn,
      description: 'Loan History Retrieval Lambda ARN',
    });
  }
} 