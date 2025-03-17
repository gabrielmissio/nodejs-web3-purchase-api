 - [Node.js](https://nodejs.org/en)
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
aws cloudformation create-stack \
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

### Upload Data to Config Bucket

```bash
sh ./tools/stacks/_setup-ec2.sh $APP_NAME $REGION
```

and

```bash
sh ./tools/stacks/deploy-listener.sh $APP_NAME $REGION $STAGE
```

### Setup Parameters and Secrets

Create Admin Account Key Secret

```bash
aws secretsmanager create-secret \
    --name ${APP_NAME}/AdminKey/${STAGE} \
    --secret-string '{"accountKey":"<PRIVATE_KEY>"}'
    --region ${REGION}
```

Create JWT Secret

```bash
aws secretsmanager create-secret \
    --name ${APP_NAME}/JWTSecret/${STAGE} \
    --secret-string '{"jwtSecret":"<MY_SECRET>"}' \
    --region ${REGION}
```

### DocumentDB

```bash
aws cloudformation create-stack \
    --region ${REGION} \
    --stack-name ${APP_NAME}-DocumentDB \
    --template-body file://tools/stacks/backend/documentdb.yml \
    --parameters ParameterKey=AppName,ParameterValue=${APP_NAME} \
    --capabilities CAPABILITY_AUTO_EXPAND CAPABILITY_NAMED_IAM
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
    --template-body file://tools/stacks/blockchain/ec2-instances.yml \
    --parameters ParameterKey=AppName,ParameterValue=${APP_NAME} \
        ParameterKey=S3BucketName,ParameterValue=${CONFIG_BUCKET_NAME} \
    --capabilities CAPABILITY_IAM
```

### Start EVM RPC Node

```bash
cd
cd /home/ec2-user/Utils/hardhat-package/hardhat-package
nohup npm run hardhat -- node --hostname 0.0.0.0 > hardhat.log 2>&1 &
```

### Lorem (apenas no dia 0)

:warning: **É necessário setar as variáveis de ambiente antes de rodar o script**

```bash
echo ADMIN_KEY_SECRET: $(
    aws secretsmanager get-secret-value \
    --secret-id ${APP_NAME}/AdminKey/${STAGE} \
    --query ARN \
    --output text
)
echo JWT_SECRET_ARN: $(
    aws secretsmanager get-secret-value \
    --secret-id ${APP_NAME}/JWTSecret/${STAGE} \
    --query ARN \
    --output text
)
```

```bash
export FIRST_ADM_USERNAME="admin"
export FIRST_ADM_PASSWORD="Abcd1234#"
export ADMIN_KEY_SECRET_ARN="<ADMIN_KEY_SECRET_ARN>"
export JWT_SECRET_ARN="<JWT_SECRET_ARN>"
export PURCHASE_EVENT_PROXY_ADDRESS="0x5fbdb2315678afecb367f032d93f642f64180aa3"
```

```bash
cd
cd /home/ec2-user/Web3App/dev/listener/backend/src
node scripts/prepare-environment.js
```

### Start Listener

:warning: **É necessário setar as variáveis de ambiente antes de rodar o script**

```bash
export ADMIN_KEY_SECRET_ARN="<ADMIN_KEY_SECRET_ARN>"
export PURCHASE_EVENT_PROXY_ADDRESS="0x5fbdb2315678afecb367f032d93f642f64180aa3"
```

```bash
cd
cd /home/ec2-user/Web3App/dev/listener/backend/src

sudo touch listener.log
sudo chown ec2-user:ec2-user listener.log
sudo chmod 664 listener.log

nohup node apps/listener/index.js > listener.log 2>&1 &
```

## Backend

### Lambda Functions (and API Gateway)

Carregar nome do bucket S3 e ids dos secredos

```bash
export DEPLOYMENT_BUCKET_NAME=$(
    aws cloudformation describe-stacks \
    --region ${REGION} \
    --stack-name ${APP_NAME}-S3ConfigBucket \
    --query 'Stacks[0].Outputs[1].OutputValue' \
    --output text
)
export ADMIN_KEY_SECRET=$(
    aws secretsmanager get-secret-value \
    --secret-id ${APP_NAME}/AdminKey/${STAGE} \
    --query ARN \
    --output text
)
export JWT_SECRET=$(
    aws secretsmanager get-secret-value \
    --secret-id ${APP_NAME}/JWTSecret/${STAGE} \
    --query ARN \
    --output text
)
```

```bash
cd ./tools/stacks/backend
mkdir -p .serverless
sam package --template-file lambda-functions.yml \
    --output-template-file .serverless/lambda-functions.yml \
    --s3-bucket ${DEPLOYMENT_BUCKET_NAME} \
    --s3-prefix sam/${APP_NAME}/${STAGE}/lambda-functions
```

```bash
cd ../../../backend/src
npm i --omit=dev
cd ../../tools/stacks/backend
sam deploy --template-file lambda-functions.yml \
    --stack-name ${APP_NAME}-Lambdas-${STAGE} \
    --s3-bucket ${DEPLOYMENT_BUCKET_NAME} \
    --s3-prefix sam/${APP_NAME}/${STAGE}/lambda-functions \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides AppName=${APP_NAME} StageName=${STAGE} \
        JWTSecret=${JWT_SECRET} AdminKeySecret=${ADMIN_KEY_SECRET} PurchaseEventProxy="0x5FbDB2315678afecb367f032d93F642f64180aa3"
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

### Deploy frontend files

```bash
sh ./tools/stacks/deploy-frontend.sh $APP_NAME $REGION $STAGE
```
