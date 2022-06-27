/**
* @type import('hardhat/config').HardhatUserConfig
*/

require("@nomiclabs/hardhat-ethers");
require("./scripts/deploy.js");
require('dotenv').config();

const { PROVIDER, ALCHEMY_KEY, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.9",
  defaultNetwork: "local",
  networks: {
    hardhat: {},
    local: {
      url: "http://127.0.0.1:8545",
      accounts: ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80']
    },
    goerli: {
      url: `${PROVIDER}${ALCHEMY_KEY}`,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  },
}