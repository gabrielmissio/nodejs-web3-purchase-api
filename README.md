# EVM Shop API

## Configuração do Projeto

Primeiro, instale as dependências necessárias:

``` bash
npm install
```

Em seguida, configure suas variáveis de ambiente:

``` bash
cp .env.example .env
```

Opcionalmente, criptofrafe suas variáveis sensíveis

```bash
dotenvx set ACCOUNT_KEY "PUT YOUR PRIVATE KEY HERE" --encrypt
# Alternatively, use the private key from ".env.example"
dotenvx set ACCOUNT_KEY "$(grep '^ACCOUNT_KEY' .env.example | awk -F '=' '{gsub(/"/, "", $2); print $2}')" --encrypt
```

## Configurar Ambiente de Desenvolvimento

Utilize o `docker compose` para subir o banco de dados em localhost.

```bash
docker compose up -d
# ou
docker-compose up -d
```

Em seguida, utilize o `hardhat` para subir um node EVM em localhost.

``` bash
npm run hardhat -- node
```

Agora vamos executar alguns scripts para aplicar as configurações inicias da aplicação. O que consiste em criar o primeiro usuario admin, e implantar o contrato de proxy na rede do hardhat.

```bash
export FIRST_ADM_USERNAME="admin"
export FIRST_ADM_PASSWORD="Abcd1234#"

dotenvx run -- node scripts/prepare-environment
```

De forma opcional, execute o script `product seeder` para popular o banco de dados e a blockchain com alguns exemplos de produtos.

```bash
dotenvx run -- node scripts/product-seeder
```

## Iniciar Aplicação

### API (e Listener)

Para executar a API no modo de desenvolvimento, use o seguinte comando:

```bash
npm run dev:api
```

Este comando inicia o servidor com o nodemon, que reiniciará automaticamente o servidor sempre que houver alterações nos arquivos do projeto.


### Frontend

Para executar o frontend no modo de desenvolvimento, use o seguinte comando:

```bash
npm run dev:front
```

## Contratos Inteligentes

### Compilação e Sincronização

Compile os contratos e sincronize as ABI (apenas se os contratos forem alterados):

```bash
npm run hardhat -- compile
cp ./blockchain/artifacts/Purchase.sol/Purchase.json ./blockchain/abis/Purchase.json
cp ./blockchain/artifacts/PurchaseEventProxy.sol/PurchaseEventProxy.json ./blockchain/abis/PurchaseEventProxy.json
```

### Integração com Remix IDE (Opcional)

```bash
npx @remix-project/remixd -s ./blockchain --remix-ide https://remix.ethereum.org
```
