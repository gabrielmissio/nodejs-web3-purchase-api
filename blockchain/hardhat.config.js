require('@nomicfoundation/hardhat-ethers')

module.exports = {
  solidity: {
    version: '0.8.4',
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  networks: {
    localhost: {
      url: process.env.RCP_URL,
      accounts: [process.env.ACCOUNT_KEY],
    },
  },
}
