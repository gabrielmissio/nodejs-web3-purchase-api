# Luckie Tech Resources

## Deploying the stacks

Load the following environment variables:

```bash
export STAGE=dev
export APP_NAME=lck
export REGION=us-east-1
```

### Bucket

```bash
aws cloudformation create-stack \
    --stack-name ${APP_NAME}-web-app-bucket-${STAGE} \
    --template-body file://bucket.yml \
    --parameters ParameterKey=AppName,ParameterValue=${APP_NAME} \
                 ParameterKey=StageName,ParameterValue=${STAGE}
```

### CloudFront

```bash
aws cloudformation create-stack \
    --stack-name ${APP_NAME}-web-app-cloudfront-${STAGE} \
    --template-body file://cloudfront.yml \
    --parameters ParameterKey=AppName,ParameterValue=${APP_NAME} \
                 ParameterKey=StageName,ParameterValue=${STAGE}
```

### Bucket Policy

```bash
aws cloudformation create-stack \
    --stack-name ${APP_NAME}-web-app-bucket-policy-${STAGE} \
    --template-body file://bucket-policy.yml \
    --parameters ParameterKey=AppName,ParameterValue=${APP_NAME} \
                 ParameterKey=StageName,ParameterValue=${STAGE}
```
