import { type HardhatRuntimeEnvironment } from "hardhat/types";
import { type BigNumber } from "ethers";
import { type Contract, type Wallet } from "zksync-web3";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { type TokenConfig } from "../../configuration/parameters-price-oracle";
import parametersMainnet from "../../configuration/parameters-price-oracle";

export default async function (hre: HardhatRuntimeEnvironment): Promise<void> {
  const wallet: Wallet = await hre.getZkWallet();

  const deployer: Deployer = new Deployer(hre, wallet);

  const contractFullyQualifedName = "contracts/PriceOracle/PriceOracle.sol:PriceOracle";
  const artifact = await deployer.loadArtifact(contractFullyQualifedName);

  const args: TokenConfig[][] = [parametersMainnet];

  // Estimate contract deployment fee
  const deploymentFee: BigNumber = await deployer.estimateDeployFee(
    artifact,
    args,
  );

  const parsedFee: string = hre.ethers.utils.formatEther(
    deploymentFee.toString(),
  );
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

  const contract: Contract = await deployer.deploy(artifact, args);

  hre.recordAddress("oracles", "priceOracle", contract.address);

  // obtain the Constructor Arguments
  console.log("constructor args: ", contract.interface.encodeDeploy(args));

  // Show the contract info
  const contractAddress: string = contract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);

  if ("verifyURL" in hre.network.config) {
    // Verify contract programmatically
    //
    // Contract MUST be fully qualified name (e.g. path/sourceName:contractName)
    const verificationId: number = await hre.run("verify:verify", {
      address: contractAddress,
      contract: contractFullyQualifedName,
      constructorArguments: args,
      bytecode: artifact.bytecode,
    });
    console.log(
      `${contractFullyQualifedName} verified! VerificationId: ${verificationId}`,
    );
  }
}
