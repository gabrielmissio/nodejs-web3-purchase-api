# nodejs-web3-purchase-api

## Project Setup

First, install the necessary dependencies

``` bash
npm install
```

Next, set up your environment variables:

``` bash
cp .env.example .env
```

Encrypting Your Private Key (Optional)

```bash
dotenvx set ACCOUNT_KEY "PUT YOUR PRIVATE KEY HERE" --encrypt
# Alternatively, use the private key from ".env.example"
dotenvx set ACCOUNT_KEY "$(grep '^ACCOUNT_KEY' .env | awk -F '=' '{print $2}')" --encrypt
```

## Starting the API in Development Mode

To run the API in development mode, use the following command:

```bash
npm run dev
```

This command starts the server with nodemon, which will automatically restart the server upon any file changes in your project.

## Localhost Blockchain
Navigate to the blockchain directory and start a Hardhat node:

``` bash
npm run hardhat -- node
```

## Integrating with Remix IDE (Optional)

For local development with the Remix IDE, start the Remixd service:

``` bash
npx @remix-project/remixd -s ./blockchain --remix-ide https://remix.ethereum.org
```

This setup allows you to directly interact with and test your smart contracts on the local Hardhat node through the Remix IDE, providing a seamless development environment.

## Compiling and Syncing Smart Contracts

Compile the smart contracts to generate the necessary ABIs. This step is only required if you have made changes to the existing contracts:

``` bash
npm run hardhat -- compile
```

After compilation, copy the ABI file for the Purchase contract to the appropriate directory:

``` bash
cp ./blockchain/artifacts/purchase.sol/Purchase.json ./blockchain/abis/Purchase.json
```