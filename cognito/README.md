# Passwordless CDK

## Requirements

- [Create an AWS account](https://portal.aws.amazon.com/gp/aws/developer/registration/index.html) if you do not already have one and log in. The IAM user that you use must have sufficient permissions to make necessary AWS service calls and manage AWS resources.
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) installed and configured
- [AWS CDK Toolkit](https://docs.aws.amazon.com/cdk/latest/guide/cli.html) installed and configured
- [Node and NPM](https://nodejs.org/en/download/) installed

## Deployment Instructions

0. Create Verified Identities in SES

   A verified email address you use to send email through Amazon SES.

1. Install dependencies

   ```
   npm install
   ```

2. Deploy the stack to your default AWS account and region. The output of this command should give you the HTTP API URL.

   ```
   cdk deploy --parameters SenderEmail=your@verified.email
   ```

3. After deployment over, you can find the cognito userpool id and app client id in output. Use it in the client config.
