import "dotenv/config";
import { HardhatUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-ethers";
import "@matterlabs/hardhat-zksync-toolbox";
import "@zoroprotocol/hardhat-zksync-web3";
import "@zoroprotocol/hardhat-addresses";

import richWallets from "./rich-wallets.json";

const { ETH_KEYSTORE = "" } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.7",
  zksolc: {
    version: "1.3.18",
  },
  networks: {
    zkLocal: {
      url: "http://localhost:8011",
      ethNetwork: "localhost",
      chainId: 260,
      zksync: true,
      zkWallet: {
        privateKey: richWallets[0].privateKey,
      },
    },
    zkTestnet: {
      url: "https://testnet.era.zksync.dev", // The testnet RPC URL of zkSync Era network.
      ethNetwork: "goerli", // The Ethereum Web3 RPC URL, or the identifier of the network (e.g. `mainnet` or `goerli`)
      chainId: 280,
      zksync: true,
      verifyURL:
        "https://zksync2-testnet-explorer.zksync.dev/contract_verification", // Verification endpoint
      zkWallet: {
        keystore: ETH_KEYSTORE,
      },
    },
    zkSyncMainnet: {
      url: "https://mainnet.era.zksync.io",
      ethNetwork: "mainnet",
      chainId: 324,
      zksync: true,
      verifyURL: "https://zksync2-mainnet-explorer.zksync.io/contract_verification",
      zkWallet: {
        keystore: ETH_KEYSTORE,
      },
    },
  },
  defaultNetwork: "zkLocal", // optional (if not set, use '--network zkTestnet')
};

export default config;
