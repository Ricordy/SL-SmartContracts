import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import { CoinTest, CoinTest__factory } from "../typechain-types";
import addresses from "../utils/addresses";

const investmentValue: number = 1000;

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner: SignerWithAddress = accounts[0];
  const firstInvestor: SignerWithAddress = accounts[1];

  const paymentTokenFactory = new CoinTest__factory(owner);

  const paymentTokenContract: CoinTest = paymentTokenFactory.attach(
    addresses.paymentTokenAddress0
  );

  console.log(`Minting ${investmentValue} tokens to Investor1: `);
  await paymentTokenContract.connect(firstInvestor).mint(investmentValue);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
