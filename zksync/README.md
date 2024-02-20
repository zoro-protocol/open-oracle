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
