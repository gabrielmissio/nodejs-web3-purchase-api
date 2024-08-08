 - Docker
 - Node.js
 - [AWS CLI](https://docs.aws.amazon.com/pt_br/cli/latest/userguide/getting-started-install.html)
 - [AWS SAN](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

# Stacks

Carregar as variáveis de ambiente:

```bash
export STAGE=dev
export REGION=us-east-1
export APP_NAME=Web3App
```

## Blockchain

Lorem ipsum

## Backend

### Deployment Bucket

Deploy the config bucket:

```bash
aws cloudformation create-stack \
    --region ${REGION} \
    --stack-name ${APP_NAME}-S3DeploymentBucket \
    --template-body file://tools/stacks/backend/deployment-bucket.yml \
    --parameters ParameterKey=AppName,ParameterValue=${APP_NAME}
```

Get stack outputs (bucket name and bucket arn):

```bash
aws cloudformation describe-stacks \
    --region ${REGION} \
    --stack-name ${APP_NAME}-S3DeploymentBucket \
    --query 'Stacks[0].Outputs'
```

### DocumentDB

```bash
aws cloudformation create-stack \
    --region ${REGION} \
    --stack-name ${APP_NAME}-DocumentDB-${STAGE} \
    --template-body file://tools/stacks/backend/documentdb.yml \
    --parameters ParameterKey=AppName,ParameterValue=${APP_NAME}
```

### DynamoDB Tables

```bash
aws cloudformation create-stack \
    --region ${REGION} \
    --stack-name ${APP_NAME}-DynamodbTables-${STAGE} \
    --template-body file://tools/stacks/backend/dynamodb-tables.yml \
    --parameters ParameterKey=AppName,ParameterValue=${APP_NAME}
```

### Lambda Functions (and API Gateway)

Carregar nome do bucket S3

```bash
export DEPLOYMENT_BUCKET_NAME=$(
    aws cloudformation describe-stacks \
    --region ${REGION} \
    --stack-name ${APP_NAME}-S3DeploymentBucket \
    --query 'Stacks[0].Outputs[1].OutputValue' \
    --output text
)
```

```bash
sam package --template-file lambda-functions.yml \
    --output-template-file .serverless/lambda-functions.yml \
    --s3-bucket ${DEPLOYMENT_BUCKET_NAME}
```

```bash
sam deploy --template-file lambda-functions.yml \
    --stack-name ${APP_NAME}-Lambdas-${STAGE} \
    --s3-bucket ${DEPLOYMENT_BUCKET_NAME} \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides StageName=${STAGE} AppName=${APP_NAME}
```

## Frontend

### Cloudfront and S3 Bucket

```bash
aws cloudformation create-stack \
    --region ${REGION} \
    --stack-name ${APP_NAME}-StaticWebsite-${STAGE} \
    --template-body file://tools/stacks/frontend/static-website.yml \
    --parameters ParameterKey=AppName,ParameterValue=${APP_NAME}
```


### Sync frontend build to S3 bucket

## Utils

## Get deployed stacks info

```bash
sh ./tools/get-stacks-info.sh $APP_NAME $REGION $STAGE
```

## Sync local ABIs with S3

```bash
sh ./tools/abi-sync.sh $APP_NAME $REGION $STAGE
```
