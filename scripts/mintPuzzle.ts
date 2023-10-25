import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import addresses from "../utils/addresses";

import { SLCoreTest__factory, SLCoreTest } from "../typechain-types";

async function main() {
  const ceo: SignerWithAddress = await ethers.getSigner(
    process.env.CEO_ADDRESS as string
  );

  const puzzleContractFactory = new SLCoreTest__factory(ceo);

  const puzzleContract: SLCoreTest = puzzleContractFactory.attach(
    addresses.puzzleAddress
  );

  console.log("Minting puzzle pieces for Investor1: ");
  console.log(
    "----------------------------------------------------------------------------------------"
  );
  const mintTx = await puzzleContract.connect(ceo).mintTest(1);
  console.log("10 uniques puzzles pieces from level 1 were minted");
  console.log(
    "----------------------------------------------------------------------------------------"
  );
  mintTx.wait(1);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
