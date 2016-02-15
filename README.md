# Slacktrail

A Lambda function to Pipe AWS CloudTrail events from CloudWatch logs into a Slack channel.

![](http://i.imgur.com/OO8AIYW.png)

## Usage

### 1. Setup your dotenv file

Copy the sample `env` file to .env and edit with the appropriate specifics
about your environment.

### 2. Create the Lambda function

```console
$ npm install
$ jake create
```

### 3. [Setup CloudTrail to log to Cloudwatch][send-cloudtrail-events-to-cloudwatch-logs]

[send-cloudtrail-events-to-cloudwatch-logs]: http://docs.aws.amazon.com/awscloudtrail/latest/userguide/send-cloudtrail-events-to-cloudwatch-logs.html
