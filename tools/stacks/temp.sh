aws s3 cp s3://web3app-s3configbucket-configbucket-ehtpsiurulr9/ec2/Utils/hardhat-package.tar.gz /home/ec2-user/Utils/hardhat-package.tar.gz
nohup npm run hardhat -- node --hostname 0.0.0.0 > hardhat.log 2>&1 &
tar -xzvf hardhat-package.tar.gz
# run on local
# mkdir hardhat-package
# cd hardhat-package
# npm init -y
# # nvm use 16
# npm install --save-dev hardhat
# # add hardhat.config.js
# cp ../blockchain/hardhat.config.js .

# add npm scripts to package.json (hardhat run node)
# command line to create script on package.json

# zip the hardhat-package directory into .serverless/hardhat-package.zip (ommiting the .git)
zip -r tools/stacks/backend/.serverless/hardhat-package.zip hardhat-package
aws s3 cp tools/stacks/backend/.serverless/hardhat-package.zip $S3_PATH/ec/Utils/hardhat-package.zip


# run on EC2
export AppName="Web3App"
export StageName="dev"

AppName="Web3App"
StageName="dev"

mkdir -p /home/ec2-user/${AppName}/${StageName}/listener
# Download application zip build from S3
aws s3 cp s3://web3app-s3configbucket-configbucket-ehtpsiurulr9/ec2/Web3App/dev/listener/listener-build.zip /home/ec2-user/${AppName}/${StageName}/listener/listener-build.zip
# Unzip the application build
unzip /home/ec2-user/${AppName}/${StageName}/listener/listener-build.zip -d /home/ec2-user/${AppName}/${StageName}/listener
# Remove the application zip build
rm /home/ec2-user/${AppName}/${StageName}/listener/listener-build.zip

mkdir -p /home/ec2-user/Utils
aws s3 cp s3://web3app-s3configbucket-configbucket-ehtpsiurulr9/ec2/Utils/hardhat-package.zip /home/ec2-user/Utils/hardhat-package.zip
unzip /home/ec2-user/Utils/hardhat-package.zip d /home/ec2-user/Utils/hardhat-package


mkdir -p /home/ec2-user/${AppName}/${StageName}/listener
        # Download application zip build from S3
        aws s3 cp s3://${S3BucketName}/ec2/${AppName}/${StageName}/listener/listener-build.zip /home/ec2-user/${AppName}/${StageName}/listener/listener-build.zip
        # Unzip the application build
        unzip /home/ec2-user/${AppName}/${StageName}/listener/listener-build.zip -d /home/ec2-user/${AppName}/${StageName}/listener
        # Remove the application zip build
        rm /home/ec2-user/${AppName}/${StageName}/listener/listener-build.zip