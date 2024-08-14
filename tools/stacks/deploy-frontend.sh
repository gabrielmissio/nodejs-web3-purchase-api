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

STACK_NAME="${appName}-StaticWebsite-${stage}"
API_STACK_NAME="${appName}-Lambdas-${stage}"

# Adjust stack output key if necessary
S3_BUCKET=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region "$region" --query "Stacks[0].Outputs[?OutputKey=='StaticWebsiteBucketName'].OutputValue" --output text)
API_URL=$(aws cloudformation describe-stacks --stack-name $API_STACK_NAME --region "$region" --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayCustomerInvokeURL'].OutputValue" --output text)

if [ -z "$S3_BUCKET" ]; then
    echo "Failed to retrieve S3 bucket name from CloudFormation stack. Please check the stack name and output key."
    exit 1
fi

if [ -z "$API_URL" ]; then
    echo "Failed to retrieve API URL from CloudFormation stack. Please check the stack name and output key."
    exit 1
fi

echo "Deploying website to S3 bucket: $S3_BUCKET"
echo "API URL: $API_URL"

# Create a temporary copy of app.js
TEMP_APP_JS="./frontend/public/app.temp.js"
cp ./frontend/public/app.js $TEMP_APP_JS

# Replace 'http://localhost:3000' with the actual API URL in the temporary file
sed -i "s|http://localhost:3000|$API_URL/|g" $TEMP_APP_JS

# Sync the temporary file and other website files to the S3 bucket
S3_PATH="s3://$S3_BUCKET"
echo "Syncing website files to $S3_PATH"

aws s3 sync ./frontend/public $S3_PATH --exclude "app.js" --exclude "app.temp.js"
aws s3 cp $TEMP_APP_JS $S3_PATH/app.js

# Check if the sync command was successful
if [ $? -eq 0 ]; then
    echo "Sync completed successfully."
else
    echo "Sync failed. Please check the AWS CLI output for details."
    exit 1
fi

# Remove the temporary file after deployment
rm $TEMP_APP_JS
