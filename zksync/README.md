# Zoro Open Oracle

## Production Deployment

### Run deployment script

Use the same deployer account that will be used to deploy the full Zoro Protocol to avoid permission issues during configuration.

```bash
npm run deploy
```

### Configure tokens

Run the full [Zoro Protocol deploy script](https://github.com/zoro-protocol/zoro-protocol/tree/master/zksync). This script will configure the oracle for any deployed `CToken` contracts.

### Transfer ownership to a multisig

1. Use the zkSync block explorer to manually call `transferOwnership`, with `newOwner` set to a multisig address, from the deployer account.
2. Manually call `acceptOwnership` from the multisig account.

## Configure for a new `CToken`

Call `addConfig` with the following parameters:

- The smallest units of measurement in a single whole unit of the underlying asset.
  E.g. ETH would be 1e18, or 1,000,000,000,000,000,000.
- Address of the `CToken`.
- Address of the Chainlink price feed for the underlying asset.

### Oracle owned by an EOA

Use the zkSync block explorer to call the function.

### Oracle owned by a Gnosis Safe multisig

Use the Gnosis Safe transaction builder to call the function.
