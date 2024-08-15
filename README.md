# EVM Shop API

## Implatação no Ambiente AWS

Siga os passos presentes no arquivo `tools/stacks/README.md` para implantar a aplicação no ambiente AWS.

## Configurar Ambiente de Desenvolvimento

 - TODO: Adicionar instruções para configurar o ambiente de desenvolvimento.
 - TODO: Adicionar instruções para testar API e Listener localmente.

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