 - Docker
 - Node.js
 - [AWS CLI](https://docs.aws.amazon.com/pt_br/cli/latest/userguide/getting-started-install.html)
 - [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

# Stacks

Carregar as variáveis de ambiente:

```bash
export STAGE=dev
export REGION=us-east-1
export APP_NAME=Web3App
```

## Global

### VPC

```bash
aws cloudformation update-stack \
    --region ${REGION} \
    --stack-name ${APP_NAME}-VPC \
    --template-body file://tools/stacks/global/vpc.yml \
    --parameters ParameterKey=AppName,ParameterValue=${APP_NAME}
```

### Config Bucket

Deploy the config bucket:

```bash
aws cloudformation create-stack \
    --region ${REGION} \
    --stack-name ${APP_NAME}-S3ConfigBucket \
    --template-body file://tools/stacks/global/config-bucket.yml \
    --parameters ParameterKey=AppName,ParameterValue=${APP_NAME}
```

Get stack outputs (bucket name and bucket arn):

```bash
aws cloudformation describe-stacks \
    --region ${REGION} \
    --stack-name ${APP_NAME}-S3ConfigBucket \
    --query 'Stacks[0].Outputs'
```

## Blockchain

### RPC Node

```bash
export CONFIG_BUCKET_NAME=$(
    aws cloudformation describe-stacks \
    --region ${REGION} \
    --stack-name ${APP_NAME}-S3ConfigBucket \
    --query 'Stacks[0].Outputs[1].OutputValue' \
    --output text
)
```

```bash
aws cloudformation create-stack \
    --region ${REGION} \
    --stack-name ${APP_NAME}-EC2Instances \
    --template-body file://tools/stacks/backend/ec2-instances.yml \
    --parameters ParameterKey=AppName,ParameterValue=${APP_NAME} \
        ParameterKey=S3BucketName,ParameterValue=${CONFIG_BUCKET_NAME} \
    --capabilities CAPABILITY_IAM
```

## Backend

### DocumentDB

```bash
aws cloudformation create-stack \
    --region ${REGION} \
    --stack-name ${APP_NAME}-DocumentDB \
    --template-body file://tools/stacks/backend/documentdb.yml \
    --parameters ParameterKey=AppName,ParameterValue=${APP_NAME} \
    --capabilities CAPABILITY_AUTO_EXPAND CAPABILITY_NAMED_IAM
```

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
    --s3-prefix sam/${APP_NAME}/${STAGE}/lambda-functions
```

```bash
sam deploy --template-file lambda-functions.yml \
    --stack-name ${APP_NAME}-Lambdas-${STAGE} \
    --s3-bucket ${DEPLOYMENT_BUCKET_NAME} \
    --s3-prefix sam/${APP_NAME}/${STAGE}/lambda-functions \
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
    --parameters ParameterKey=AppName,ParameterValue=${APP_NAME} \
        ParameterKey=StageName,ParameterValue=${STAGE}
```


### Sync frontend build to S3 bucket

## Utils

## Get deployed stacks info

```bash
sh ./tools/stacks/get-stacks-info.sh $APP_NAME $REGION $STAGE
```

## Prepare files to EC2

```bash
sh ./tools/stacks/_setup-ec2.sh $APP_NAME $REGION #$STAGE
```

## Deploy frontend files

```bash
sh ./tools/stacks/deploy-frontend2.sh $APP_NAME $REGION $STAGE
```

## Sync listener files with S3

```bash
sh ./tools/stacks/deploy-listener.sh $APP_NAME $REGION $STAGE
```