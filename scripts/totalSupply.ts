import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { Address } from "wagmi";

import {
  CoinTest,
  CoinTest__factory,
  Factory,
  Factory__factory,
  SLCore,
  SLCore__factory,
  Investment,
  Investment__factory,
} from "../typechain-types";

const paymentTokenAddress: Address =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  investmentAddress: Address = "0xCafac3dD18aC6c6e92c921884f9E4176737C052c",
  puzzleAddress: Address = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  factoryAddress: Address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  sllogicsAddress: Address = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  investmentValue: number = 1000;

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner: SignerWithAddress = accounts[0];
  const firstInvestor: SignerWithAddress = accounts[1];

  const investmentFactory = new Investment__factory(owner);
  const investmentContract: Investment =
    investmentFactory.attach(investmentAddress);

  console.log(await investmentContract.balanceOf(firstInvestor.address));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
