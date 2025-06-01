import {
  Stack,
  StackProps,
  Duration,
  CfnOutput,
  aws_lambda as lambda,
} from 'aws-cdk-lib'
import {
  WebSocketApi,
  WebSocketStage,
} from '@aws-cdk/aws-apigatewayv2-alpha'
import { 
  WebSocketLambdaIntegration
} from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import { Construct } from 'constructs'

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const proxy = new lambda.Function(this, 'BedrockProxy', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('../lambda'),
      handler: 'handler.main',
      timeout: Duration.seconds(30),
      environment: {
        MODEL_ID: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      }
    })

    const authorizerFn = new lambda.Function(this, 'JwtAuthorizer', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('../lambda'),
      handler: 'index.handler',
    })

    const api = new WebSocketApi(this, 'ChatWsApi', {
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration('ConnectInt', proxy),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration('DisconnectInt', proxy),
      },
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration('DefaultInt', proxy),
      },
    })

    new WebSocketStage(this, 'DevStage', {
      webSocketApi: api,
      stageName: 'dev',
      autoDeploy: true,
    })

    this.urlOutput(api.apiEndpoint + '/dev')
  }

  private urlOutput(url: string) {
    new CfnOutput(this, 'WssUrl', { value: url, exportName: 'WssEndpoint'})
  }
}