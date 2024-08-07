## Backend

### DynamoDB Tables

### Lambda Functions (and API Gateway)

sam package --template-file lambda-functions.yml \
    --output-template-file packaged.yml \ --s3-bucket my-temp-deployment-bucket

sam deploy --template-file packaged.yml \
    --stack-name my-sam-stack \
    --s3-bucket my-temp-deployment-bucket \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides StageName=dev AppName=MyApiName

## Frontend

### Cloudfront and S3 Bucket

### Sync frontend build to S3 bucket
