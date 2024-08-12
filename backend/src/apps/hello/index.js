const { JsonRpcProvider } = require('ethers')

const provider = new JsonRpcProvider(process.env.RCP_PROVIDER_PRIVATE_IP)

module.exports.handler = async (event) => {
  try {
    console.log('event', event)
    const { chainId } = await provider.getNetwork()
    console.log('chainId', chainId)

    return true
  } catch (error) {
    console.error('error', error)
    return false
  }
}
