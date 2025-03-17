#!/bin/bash

# Check if at least the correct number of arguments is provided
if [ "$#" -lt 3 ]; then
    echo "Usage: $0 <appName> <region> <stage>"
    exit 1
fi

# Assign arguments to variables
appName=$1
region=$2
stage=$3

STACK_NAME="${appName}-S3ConfigBucket"

# TODO: adjust stack output key if necessary (it is ...)
S3_BUCKET=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region "$region" --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" --output text)

if [ -z "$S3_BUCKET" ]; then
    echo "Failed to retrieve S3 bucket name from CloudFormation stack. Please check the stack name and output key."
    exit 1
fi

S3_PATH="s3://$S3_BUCKET/ec2/$appName/$stage/listener"
echo "Syncing Listener to $S3_PATH"

# install only production dependencies on the backend (./backend/src)
cd backend/src
npm install --omit=dev
npm i -D @aws-sdk/client-secrets-manager @aws-sdk/client-s3
cd ../../


# Download DocumentDB certificate
mkdir -p tools/stacks/backend/.serverless
curl https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem --output backend/src/global-bundle.pem
# zip the backend/src directory into .serverless/listener.zip (ommiting the .git)
zip -r tools/stacks/backend/.serverless/listener-build.zip backend/src -x "*/.git/*"
# Remove the downloaded file
rm backend/src/global-bundle.pem

# Sync the local directory to the S3 bucket
aws s3 cp tools/stacks/backend/.serverless/listener-build.zip $S3_PATH/listener-build.zip
aws s3 cp blockchain/abis/PurchaseEventProxy.json $S3_PATH/abis/PurchaseEventProxy.json
aws s3 cp blockchain/abis/Purchase.json $S3_PATH/abis/Purchase.json

# Check if the sync command was successful
if [ $? -eq 0 ]; then
    echo "Sync completed successfully."
else
    echo "Sync failed. Please check the AWS CLI output for details."
    exit 1
fi
