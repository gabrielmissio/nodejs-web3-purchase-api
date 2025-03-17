const { JsonRpcProvider } = require('ethers')

const provider = new JsonRpcProvider(
  `http://${process.env.RCP_PROVIDER_PRIVATE_IP}:8545`,
)

module.exports.handler = async (event) => {
  try {
    console.log('event', event) // API Gateway event
    // get request body
    const body = JSON.parse(event.body)
    console.log('body', body)

    const { chainId } = await provider.getNetwork()
    console.log('chainId', chainId)

    // send body to provider "as a proxy"
    const result = await provider.send(body.method, body.params)
    console.log('result', result)

    // {"jsonrpc":"2.0","id":"1723601512179","result":"0x7a69"}
    // TODO: format result to return like a JSON-RPC response
    return {
      statusCode: 200,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: body.id,
        result,
      }),
    }
  } catch (error) {
    console.error('error', error)
    return false
  }
}
//module.exports.handler({}) // test
