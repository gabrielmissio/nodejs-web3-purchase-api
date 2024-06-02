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
dotenvx set ACCOUNT_KEY "$(grep '^ACCOUNT_KEY' .env.example | awk -F '=' '{gsub(/"/, "", $2); print $2}')" --encrypt
```

## Localhost Database

``` bash
docker compose up -d
# or
docker-compose up -d
```

## Localhost Blockchain

``` bash
npm run hardhat -- node
```

## Prepare Environment

(TODO: improve docs)
(create first adm and deploy PurchaseEventProxy)
```bash
export FIRST_ADM_USERNAME="admin"
export FIRST_ADM_PASSWORD="Abcd1234#"

dotenvx run -- node scripts/prepare-environment
```

## Run Seeds

```bash
dotenvx run -- node scripts/product-seeder
```

## Starting the API in Development Mode

To run the API in development mode, use the following command:

```bash
npm run dev:api
```

This command starts the server with nodemon, which will automatically restart the server upon any file changes in your project.

## Starting the frontend in Development Mode

To run the frontend in development mode, use the following command:

```bash
npm run dev:front
```

## Compiling and Syncing Smart Contracts

Compile the smart contracts to generate the necessary ABIs. This step is only required if you have made changes to the existing contracts:

``` bash
npm run hardhat -- compile
```

After compilation, copy the ABI file for the Purchase contract to the appropriate directory:

``` bash
cp ./blockchain/artifacts/Purchase.sol/Purchase.json ./blockchain/abis/Purchase.json
cp ./blockchain/artifacts/PurchaseEventProxy.sol/PurchaseEventProxy.json ./blockchain/abis/PurchaseEventProxy.json
```

## Integrating with Remix IDE (Optional)

For local development with the Remix IDE, start the Remixd service:

``` bash
npx @remix-project/remixd -s ./blockchain --remix-ide https://remix.ethereum.org
```

This setup allows you to directly interact with and test your smart contracts on the local Hardhat node through the Remix IDE, providing a seamless development environment.
