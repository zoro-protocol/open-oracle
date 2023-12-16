import { ethers } from "ethers";
import { type HardhatRuntimeEnvironment } from "hardhat/types";
import { type TokenConfig } from "../../configuration/parameters-price-oracle";
import zTokens from "../zoro-protocol/zksync/deploy/addresses/zTokens.json";
import priceFeeds from "../addresses/price-feeds.json";
import assets from "./assets.json";

type AddressChainConfig = { [chainId: number]: string };
type AddressConfig = { [contract: string]: AddressChainConfig };
type AssetConfig = { [asset: string]: { decimals: number } };

export function getTokenConfigs(hre: HardhatRuntimeEnvironment): TokenConfig[] {
    const chainId: number | undefined = hre.network.config.chainId;

    if (typeof chainId === "undefined") {
        throw new Error("Chain ID is not defined");
    }

    const tokenConfigs: TokenConfig[] = [];

    for (const [key, value] of Object.entries(zTokens)) {
        const cToken: string = (value as AddressChainConfig)[chainId];
        if (cToken === undefined) {
            console.error(`No zToken for ${key} exists on chain ID ${chainId}`);
            continue;
        }

        const assetKey: string = key.split(":").pop() as string;

        const priceFeedKey = `${assetKey}-usd`;
        const priceFeed: string = (priceFeeds as AddressConfig)?.[priceFeedKey]?.[chainId];

        if (priceFeed === undefined) {
            console.error(`No price feed configured for ${priceFeedKey}`);
            continue;
        }

        const decimals: number = (assets as AssetConfig)?.[assetKey]?.decimals;
        if (decimals === undefined) {
            console.error(`No base unit configured for ${assetKey}`);
            continue;
        }
        const baseUnit: string = ethers.utils.parseUnits("1", decimals).toString();

        tokenConfigs.push({ cToken, baseUnit, priceFeed })
    };

    return tokenConfigs;
}
