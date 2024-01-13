import { ethers } from "ethers";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Wallet } from "zksync-web3";
import { type TokenConfig } from "../../configuration/parameters-price-oracle";
import { getTokenConfig } from "../scripts/token-configs";
import { AddConfigParams } from "../scripts/types";

async function main(
  hre: HardhatRuntimeEnvironment,
  underlying: string,
): Promise<void> {
  const wallet: Wallet = await hre.getZkWallet();

  const oracleAddress: string = hre.getAddress("oracles", "priceOracle");
  const oracle: ethers.Contract = await hre.ethers.getContractAt(
    "PriceOracle",
    oracleAddress,
    wallet
  );

  const config: TokenConfig = getTokenConfig(hre, underlying);

  await oracle.addConfig(config);
}

task("addConfig", "Add a token config to the price oracle")
.addPositionalParam("underlying", "Symbol of the underlying token (optionally use the pool name as a prefix, e.g. degen:wbtc)")
.setAction(
  async (
    { underlying }: AddConfigParams,
    hre: HardhatRuntimeEnvironment
  ) => {
    console.log("Adding token config...");

    await main(hre, underlying)
  }
);
