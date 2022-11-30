import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config({ path: ".env" });

const ALCHEMY_API_KEY_URL = process.env.ALCHEMY_API_KEY_URL;

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  paths: { tests: "tests" },
  networks: {
    hardhat: {
      accounts: {
        count: 16,
      },
    },
    rinkeby: {
      url: ALCHEMY_API_KEY_URL,
      accounts: [PRIVATE_KEY ?? ""],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
