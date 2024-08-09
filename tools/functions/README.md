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

## Sync listener files with S3

```bash
sh ./tools/stacks/deploy-listener.sh $APP_NAME $REGION $STAGE
```