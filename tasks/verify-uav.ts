import { ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

interface Args {
  production: string;
  proposed: string;
}

// Ignore pairs that are not configured
const IGNORED_PAIRS = ["cMATIC"];

// Pair uses a different aggregator in the new UAV
const PAIRS_WITH_EXPECTED_PRICE_DEVIATION = ["cSUSHI"];

const MAX_DEVIATION = 0.5; //%

export default async function verifyProposedUAV(
  arg: Args,
  hre: HardhatRuntimeEnvironment
) {
  const PRODUCTION_UAV_ADDR = arg.production;
  const PROPOSED_UAV_ADDR = arg.proposed;
  const RPC_URL = process.env.MAINNET_URL;

  const uavConfiguration = require("../configuration/parameters");
  const uavABI = require("../artifacts/contracts/Uniswap/UniswapAnchoredView.sol/UniswapAnchoredView.json");

  const cTokenABI = [
    {
      constant: true,
      inputs: [],
      name: "symbol",
      outputs: [{ name: "", type: "string" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  ];

  const [_, __, tokenConfigs] = uavConfiguration;
  if (!RPC_URL) {
    throw new Error("RPC URL Cannot be empty");
  }
  const provider = new hre.ethers.providers.JsonRpcProvider(RPC_URL);
  const prodUAV = new hre.ethers.Contract(
    PRODUCTION_UAV_ADDR,
    uavABI.abi,
    provider
  );
  const proposedUAV = new hre.ethers.Contract(
    PROPOSED_UAV_ADDR,
    uavABI.abi,
    provider
  );

  for (const { cToken: cTokenAddr } of tokenConfigs) {
    const checksumCTokenAddr = hre.ethers.utils.getAddress(cTokenAddr);
    const cToken = new hre.ethers.Contract(
      checksumCTokenAddr,
      cTokenABI,
      provider
    );
    const cTokenSymbol = await cToken.symbol();

    if (IGNORED_PAIRS.indexOf(cTokenSymbol) !== -1) {
      console.log(`Skipping check for ${cTokenSymbol}`);
      continue;
    }

    console.log(
      `Comparing prices for cToken ${cTokenSymbol} with address ${checksumCTokenAddr}`
    );
    const [prodUAVPrice, proposedUAVPrice] = await Promise.all([
      fetchUnderlyingPrice(
        prodUAV,
        checksumCTokenAddr,
        cTokenSymbol,
        PRODUCTION_UAV_ADDR
      ),
      fetchUnderlyingPrice(
        proposedUAV,
        checksumCTokenAddr,
        cTokenSymbol,
        PROPOSED_UAV_ADDR
      ),
    ]);

    if (!prodUAVPrice.eq(proposedUAVPrice)) {
      const errorMsg = `Price mismatch for ${cTokenSymbol}!  Prod UAV Price: ${prodUAVPrice.toString()} Proposed UAV Price: ${proposedUAVPrice.toString()}`;
      if (PAIRS_WITH_EXPECTED_PRICE_DEVIATION.indexOf(cTokenSymbol) === -1) {
        throw new Error(errorMsg);
      }
      const prodPriceNum = parseFloat(
        ethers.utils.formatEther(prodUAVPrice.toString())
      );
      const proposedPriceNum = parseFloat(
        ethers.utils.formatEther(proposedUAVPrice.toString())
      );

      const pctDeviation =
        (100 * Math.abs(prodPriceNum - proposedPriceNum)) / prodPriceNum;

      if (pctDeviation >= MAX_DEVIATION) throw new Error(errorMsg);
    }
    console.log(`Underlying prices for ${cTokenSymbol} match.`);
  }

  console.log(
    `Proposed UAV at ${PROPOSED_UAV_ADDR} passed all checks with the production UAV at ${PRODUCTION_UAV_ADDR}!`
  );
}

async function fetchUnderlyingPrice(
  uavContract: ethers.Contract,
  cTokenAddr: string,
  cTokenSymbol: string,
  proposedUAVAddr: string
) {
  try {
    return await uavContract.getUnderlyingPrice(cTokenAddr);
  } catch (e) {
    const label =
      uavContract.address === proposedUAVAddr ? "PROPOSED" : "PRODUCTION";
    throw new Error(
      `Call to getUnderlyingPrice(${cTokenAddr}) for cToken ${cTokenSymbol} to ${label} UAV at address ${uavContract.address} reverted!`
    );
  }
}
