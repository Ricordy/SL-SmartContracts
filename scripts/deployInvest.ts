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
  investmentAddress: Address = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  puzzleAddress: Address = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  factoryAddress: Address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  sllogicsAddress: Address = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  investmentValue: number = 2500;

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner: SignerWithAddress = accounts[0];
  const firstInvestor: SignerWithAddress = accounts[1];

  const paymentTokenFactory = new CoinTest__factory(owner);
  const puzzleContractFactory = new SLCore__factory(owner);
  const factoryFactory = new Factory__factory(owner);
  const investmentFactory = new Investment__factory(owner);

  const paymentTokenContract: CoinTest =
    paymentTokenFactory.attach(paymentTokenAddress);

  const puzzleContract: SLCore = puzzleContractFactory.attach(puzzleAddress);
  const factoryContract: Factory = factoryFactory.attach(factoryAddress);
  
  console.log("deploying new investment contract... ");
  await factoryContract.deployNew(100000, paymentTokenAddress, 1);

  const investmentAddress = await factoryContract.getLastDeployedContract(1);
  
  console.log("Investment 2 address: ", investmentAddress);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
