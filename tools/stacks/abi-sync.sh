#!/bin/bash

# Check if at least the correct number of arguments is provided
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <appName> <region> [stage]"
    exit 1
fi

# Assign arguments to variables
appName=$1
region=$2

# Check if stage is provided, otherwise set it to an empty string
stage=$3
if [ -z "$stage" ]; then
    stage=""
fi

STACK_NAME="${appName}-S3ConfigBucket"
S3_BUCKET=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region "$region" --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" --output text)

if [ -z "$S3_BUCKET" ]; then
    echo "Failed to retrieve S3 bucket name from CloudFormation stack. Please check the stack name and output key."
    exit 1
fi

# Adjust the S3 path based on whether the stage is provided
if [ -z "$stage" ]; then
    S3_PATH="s3://$S3_BUCKET/abis"
else
    S3_PATH="s3://$S3_BUCKET/abis/$stage"
fi

echo "Syncing ABIs to $S3_PATH"

# Sync the local directory to the S3 bucket
aws s3 sync ./blockchain/abis $S3_PATH

# Check if the sync command was successful
if [ $? -eq 0 ]; then
    echo "Sync completed successfully."
else
    echo "Sync failed. Please check the AWS CLI output for details."
    exit 1
fi
