#!/bin/bash

# Check if at least the correct number of arguments is provided
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <appName> <region>"
    exit 1
fi

# Assign arguments to variables
appName=$1
region=$2

STACK_NAME="${appName}-S3ConfigBucket"

# TODO: adjust stack output key if necessary (it is ...)
S3_BUCKET=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region "$region" --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" --output text)

if [ -z "$S3_BUCKET" ]; then
    echo "Failed to retrieve S3 bucket name from CloudFormation stack. Please check the stack name and output key."
    exit 1
fi

curl https://nodejs.org/dist/v16.20.2/node-v16.20.2-linux-x64.tar.xz --output node-v16.20.2-linux-x64.tar.xz
# Sync the local directory to the S3 bucket
S3_PATH="s3://$S3_BUCKET/ec2/Utils"
aws s3 cp node-v16.20.2-linux-x64.tar.xz $S3_PATH/node-v16.20.2-linux-x64.tar.xz
# Remove the downloaded file
rm node-v16.20.2-linux-x64.tar.xz


curl https://shared-media-from-anonymous-philanthropist.s3.amazonaws.com/hardhat-package.tar.gz --output hardhat-package.tar.gz
# Sync the local directory to the S3 bucket
aws s3 cp hardhat-package.tar.gz $S3_PATH/hardhat-package.tar.gz
# Remove the downloaded file
rm hardhat-package.tar.gz

# Check if the sync command was successful
if [ $? -eq 0 ]; then
    echo "Sync completed successfully."
else
    echo "Sync failed. Please check the AWS CLI output for details."
    exit 1
fi
