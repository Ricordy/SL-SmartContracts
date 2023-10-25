import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import { SLCoreTest, SLCoreTest__factory } from "../typechain-types";
import addresses from "../utils/addresses";

async function main() {
  const ceo: SignerWithAddress = await ethers.getSigner(
    process.env.CEO_ADDRESS as string
  );

  const puzzleContractFactory = new SLCoreTest__factory(ceo);

  const puzzleContract: SLCoreTest =
    puzzleContractFactory.attach(addresses.puzzleAddress);

  console.log("Minting puzzle pieces for Investor1: ");
  const mintTx = await puzzleContract.connect(ceo).mintTest(2);
  mintTx.wait(1);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
