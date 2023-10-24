import { ethers } from "hardhat";
import addresses from "../utils/addresses";

import {
  CoinTest,
  CoinTest__factory,
  SLCore,
  SLCore__factory,
} from "../typechain-types";

const investmentValue: number = 1000;

async function main() {
  const CEO_SIGNED = await ethers.getSigner(process.env.CEO_ADDRESS as string);

  const paymentTokenFactory = new CoinTest__factory(CEO_SIGNED);
  const clCoreContractFactory = new SLCore__factory(CEO_SIGNED);

  const paymentTokenContract: CoinTest = paymentTokenFactory.attach(
    addresses.paymentTokenAddress0
  );

  const slCoreContract: SLCore = clCoreContractFactory.attach(
    addresses.puzzleAddress
  );

  const decimals = await paymentTokenContract.decimals();

  const valueWithDecimals = ethers.utils.parseUnits(
    investmentValue.toString(),
    decimals
  );
  console.log(" Minting entry for CEO...");
  console.log(
    "----------------------------------------------------------------------------------------"
  );
  console.log("Minting 10K tokens to Investor1: ");
  await paymentTokenContract.connect(CEO_SIGNED).mint(valueWithDecimals);
  console.log(
    "Approving 10K tokens to be spend by Puzzle and Investment Contract from Investor1: "
  );
  console.log(
    "----------------------------------------------------------------------------------------"
  );
  const approveTx = await paymentTokenContract
    .connect(CEO_SIGNED)
    .approve(addresses.logicsAddress, valueWithDecimals);
  approveTx.wait();
  console.log(
    "----------------------------------------------------------------------------------------"
  );
  console.log("Minting entry for Investor1: ");
  try {
    await slCoreContract.connect(CEO_SIGNED).mintEntry();
  } catch (error: any) {
    if (error.reason.split("'")[1] == "") {
      console.log(
        "User already at level 1.   How to run this command again: \n - Localhost: restart the local node \n - Testnet: Deploy new contracts and update the utils/addresses.ts file "
      );
    } else {
      console.log(`Reason: ${error.reason.split("'")[1]}`);
    }
  }

  console.log(
    "----------------------------------------------------------------------------------------"
  );
  const userLevel = await slCoreContract.whichLevelUserHas(CEO_SIGNED.address);
  console.log(` Entry minted! User level: ${userLevel}`);
  console.log(
    "----------------------------------------------------------------------------------------"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
