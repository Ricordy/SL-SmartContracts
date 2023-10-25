import { ethers } from "hardhat";
import addresses from "../utils/addresses";

import {
  CoinTest,
  CoinTest__factory,
  SLCoreTest,
  SLCoreTest__factory,
} from "../typechain-types";

const investmentValue: number = 1000;

async function main() {
  const CEO_SIGNED = await ethers.getSigner(process.env.CEO_ADDRESS as string);

  const paymentTokenFactory = new CoinTest__factory(CEO_SIGNED);
  const clCoreContractFactory = new SLCoreTest__factory(CEO_SIGNED);

  const paymentTokenContract: CoinTest = paymentTokenFactory.attach(
    addresses.paymentTokenAddress0
  );

  const slCoreContract: SLCoreTest = clCoreContractFactory.attach(
    addresses.puzzleAddress
  );

  const decimals = await paymentTokenContract.decimals();

  let userLevel = await slCoreContract.whichLevelUserHas(CEO_SIGNED.address);

  const valueWithDecimals = ethers.utils.parseUnits(
    investmentValue.toString(),
    decimals
  );
  console.log(
    ` Minting ${Number(userLevel) == 0 ? "entry" : "level"} for CEO...`
  );
  console.log(
    "----------------------------------------------------------------------------------------"
  );
  if (Number(userLevel) == 0) {
    console.log("Minting 10K tokens to user: ");
    await paymentTokenContract.connect(CEO_SIGNED).mint(valueWithDecimals);
    console.log(
      "Approving 10K tokens to be spend by Puzzle and Investment Contract from user: "
    );
    const approveTx = await paymentTokenContract
      .connect(CEO_SIGNED)
      .approve(addresses.logicsAddress, valueWithDecimals);
    approveTx.wait();
    console.log(
      "----------------------------------------------------------------------------------------"
    );
  }
  console.log("Minting nft for CEO... ");
  try {
    await slCoreContract.connect(CEO_SIGNED).mintEntry();
  } catch (error: any) {
    if (
      error.reason.split("'")[1] == "IncorrectUserLevel(1, 0)" ||
      error.reason.split("'")[1] == "IncorrectUserLevel(2, 0)" ||
      error.reason.split("'")[1] == "IncorrectUserLevel(3, 0)"
    ) {
      console.log(
        `Attempting to mint ${Number(userLevel) + 1} level for the user!`
      );
      try {
        await slCoreContract.connect(CEO_SIGNED).claimLevel();
        console.log(
          `Successfully minted level ${Number(userLevel) + 1} to the user`
        );
      } catch (error: any) {
        console.log(`Reason: ${error.reason.split("'")[1]}`);
      }
    } else {
      console.log(`Reason: ${error.reason.split("'")[1]}`);
    }
  }

  console.log(
    "----------------------------------------------------------------------------------------"
  );
  userLevel = await slCoreContract.whichLevelUserHas(CEO_SIGNED.address);
  console.log(` NFT minted! User level: ${userLevel}`);
  console.log(
    "----------------------------------------------------------------------------------------"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
