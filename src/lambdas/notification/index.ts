import { 
  LoanApplication, 
  LoanDecision, 
  NotificationResult 
} from '../../types/loan-types';

interface NotificationEvent {
  application: LoanApplication;
  loanDecision?: {
    Payload: LoanDecision
  };
  decision?: LoanDecision;
}

export const handler = async (event: NotificationEvent): Promise<NotificationResult> => {
  // Log the event object for CloudWatch
  console.log('Notification Input:', JSON.stringify(event, null, 2));
  
  const { application } = event;
  
  // Handle both success case (loanDecision.Payload) and error case (decision)
  let decision: LoanDecision;
  if (event.loanDecision && event.loanDecision.Payload) {
    decision = event.loanDecision.Payload;
  } else if (event.decision) {
    decision = event.decision;
  } else {
    throw new Error('Invalid notification event structure: missing decision data');
  }

  // In a real implementation, this would send actual emails/SMS
  // This is a simplified simulation
  const simulateNotification = async () => {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 300));

    // Simulate 99% success rate
    const success = Math.random() < 0.99;
    if (!success) {
      throw new Error('Failed to send notification');
    }
  };

  try {
    await simulateNotification();

    // Construct notification message (in real implementation, this would be a template)
    const message = decision.approved
      ? `Congratulations! Your loan application for $${application.amount} has been approved with an interest rate of ${decision.interestRate}%`
      : `We regret to inform you that your loan application has been declined. Reason: ${decision.reason}`;

    console.log(`Notification sent to customer ${application.customerId}: ${message}`);

    return {
      sent: true,
      channel: 'both', // In real implementation, this would be based on user preferences
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new Error('Failed to send notification');
  }
}; 