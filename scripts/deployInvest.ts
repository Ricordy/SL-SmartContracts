import { ethers } from "hardhat";
import addresses from "../utils/addresses";

import { Factory } from "../typechain-types";

async function main() {
  const factoryContractFactory = await ethers.getContractFactory("Factory");
  const factoryContract: Factory = factoryContractFactory.attach(
    addresses.factoryAddress
  );

  console.log("deploying new investment contract... ");
  await factoryContract.deployNew(
    100000,
    addresses.paymentTokenAddress0,
    addresses.paymentTokenAddress1,
    1
  );

  const investmentAddress = await factoryContract.getLastDeployedContract(1);

  console.log(
    "----------------------------------------------------------------------------------------"
  );

  console.log("Investment level 1 deployed to: ", investmentAddress);
  console.log("Total investment: 100 000 €.  ");
  console.log("Payment token 1 address: ", addresses.paymentTokenAddress0);
  console.log("Payment token 2 address: ", addresses.paymentTokenAddress1);

  console.log(
    "----------------------------------------------------------------------------------------"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
