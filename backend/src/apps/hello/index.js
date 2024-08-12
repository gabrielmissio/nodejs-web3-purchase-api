const { JsonRpcProvider } = require('ethers')

const provider = new JsonRpcProvider(process.env.RCP_PROVIDER_PRIVATE_IP)

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

    return result
  } catch (error) {
    console.error('error', error)
    return false
  }
}
//module.exports.handler({}) // test
