# Run instructions

## To deploy and verify NFTEntry just run this on terminal point to ./

  ```shell
  npx hardhat run scripts/deployEntry.js --network rinkeby
  ```
## To deploy and verify both NFTPieces and NFTLevel2 run this on terminal point to ./

  ```shell
  npx hardhat run scripts/deploySync.js --network rinkeby
  ```
 
  1. Then go to [EtherScan](https://rinkeby.etherscan.io//) and search for NFTPieces.
  1. Contract -> Write Contract
  1. Execute addContractToWhitelist(address from NFTLvl2)
  
## Ready to use
  

