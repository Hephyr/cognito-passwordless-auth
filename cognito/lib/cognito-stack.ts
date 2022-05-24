import { CfnOutput, CfnParameter, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { Function, Code, Runtime } from "aws-cdk-lib/aws-lambda";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as path from "path";

export class CognitoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaCodeAsset = Code.fromAsset(path.resolve(__dirname, "lambda"));

    const defineAuthChallengeLambda = new Function(
      this,
      "DefineAuthChallengeLambda",
      {
        code: lambdaCodeAsset,
        handler: "DefineAuthChallenge.handler",
        runtime: Runtime.NODEJS_14_X,
      }
    );

    const senderEmail = new CfnParameter(this, "SenderEmail", {
      type: "String",
      allowedPattern:
        "(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])",
      description:
        "The email address to use as the sender of the email, you should use a SES verified email address.",
    });

    const createAuthChallengeLambda = new Function(
      this,
      "CreateAuthChallengeLambda",
      {
        code: lambdaCodeAsset,
        handler: "CreateAuthChallenge.handler",
        runtime: Runtime.NODEJS_14_X,
        environment: {
          SENDER_EMAIL: senderEmail.valueAsString,
        },
      }
    );

    const verifyAuthChallengeResponseLambda = new Function(
      this,
      "VerifyAuthChallengeResponseLambda",
      {
        code: lambdaCodeAsset,
        handler: "VerifyAuthChallengeResponse.handler",
        runtime: Runtime.NODEJS_14_X,
      }
    );

    createAuthChallengeLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ["ses:SendEmail", "SES:SendRawEmail"],
        resources: ["*"],
        effect: Effect.ALLOW,
      })
    );

    const pool = new UserPool(this, "UserPool", {
      userPoolName: "Passwordless",
      signInAliases: { email: true },
      lambdaTriggers: {
        defineAuthChallenge: defineAuthChallengeLambda,
        createAuthChallenge: createAuthChallengeLambda,
        verifyAuthChallengeResponse: verifyAuthChallengeResponseLambda,
      },
      selfSignUpEnabled: true,
    });

    const client = pool.addClient("app-client", {
      authFlows: {
        custom: true,
      },
    });

    new CfnOutput(this, "UserPoolId", { value: pool.userPoolId });
    new CfnOutput(this, "ClientId", { value: client.userPoolClientId });
  }
}
