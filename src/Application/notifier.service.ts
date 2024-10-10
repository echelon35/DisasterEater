import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { DisasterDataFromSQS } from 'src/DTO/disasterDataFromSQS';

export class NotifierService {
  sqsClient = new SQSClient({ region: process.env.AWS_REGION });

  async sendNotificationToSQS(disasterData: DisasterDataFromSQS) {
    const params = {
      QueueUrl: process.env.AWS_QUEUE,
      MessageBody: JSON.stringify(disasterData),
      MessageGroupId: disasterData.disaster_type + '_group',
      MessageDeduplicationId: new Date().toISOString(),
    };

    const command = new SendMessageCommand(params);
    try {
      const data = await this.sqsClient.send(command);
      console.log('Message sent to SQS:', data);
    } catch (err) {
      console.error('Error sending message to SQS:', err);
    }
  }
}
