# Run instructions

## To deploy and verify NFTEntry just run this on terminal point to ./

```shell
npx hardhat run scripts/deployEntry.js --network rinkeby
```

## To deploy and verify both NFTPieces and NFTLevel2 run this on terminal point to ./

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```
