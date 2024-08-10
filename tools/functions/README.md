# Stacks

Carregar as variáveis de ambiente:

```bash
export STAGE=dev
export REGION=us-east-1
export APP_NAME=Web3App
```

## Backend

### Lambda Functions (and API Gateway)

Carregar nome do bucket S3

```bash
export DEPLOYMENT_BUCKET_NAME=$(
    aws cloudformation describe-stacks \
    --region ${REGION} \
    --stack-name ${APP_NAME}-S3ConfigBucket \
    --query 'Stacks[0].Outputs[1].OutputValue' \
    --output text
)
```

```bash
sam package --template-file lambda-functions.yml \
    --output-template-file .serverless/lambda-functions.yml \
    --s3-bucket ${DEPLOYMENT_BUCKET_NAME} \
    --s3-prefix sam/${APP_NAME}/${STAGE}/utils-functions
```

```bash
sam deploy --template-file lambda-functions.yml \
    --stack-name ${APP_NAME}-LambdasUtils-${STAGE} \
    --s3-bucket ${DEPLOYMENT_BUCKET_NAME} \
    --s3-prefix sam/${APP_NAME}/${STAGE}/utils-functions \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides StageName=${STAGE} AppName=${APP_NAME}
```

```bash
aws lambda invoke --function-name Web3App-LambdasUtils-dev-BastionHostLambdaFunction-4E5fQ8sgwKU2 \
    --payload '{"instanceId": "i-0587ef3cd4a5321c8", "command": "uptime"}' \
    output.json
```