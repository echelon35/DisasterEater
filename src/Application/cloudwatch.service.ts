import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class CloudWatchService {
  private cloudWatchLogs: AWS.CloudWatchLogs;
  private logGroupName = 'DisasterEater';

  constructor() {
    console.log(process.env.AWS_REGION);
    // Initialisation de CloudWatch Logs
    this.cloudWatchLogs = new AWS.CloudWatchLogs({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async logToCloudWatch(logStreamName: string, message: string): Promise<void> {
    // Préparer le log event
    const params = {
      logGroupName: this.logGroupName,
      logStreamName: logStreamName,
      logEvents: [
        {
          message,
          timestamp: Date.now(),
        },
      ],
    };

    // Envoyer le log à CloudWatch Logs
    try {
      await this.cloudWatchLogs.putLogEvents(params).promise();
    } catch (error) {
      console.error("Erreur lors de l'envoi des logs à CloudWatch", error);
    }
  }
}
