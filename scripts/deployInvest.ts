import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { Address } from "wagmi";
import addresses from "../utils/addresses";

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

const investmentValue: number = 2500;

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner: SignerWithAddress = accounts[0];
  const firstInvestor: SignerWithAddress = accounts[1];

  const paymentTokenFactory = new CoinTest__factory(owner);
  const puzzleContractFactory = new SLCore__factory(owner);
  const factoryFactory = new Factory__factory(owner);
  const investmentFactory = new Investment__factory(owner);

  const paymentTokenContract: CoinTest = paymentTokenFactory.attach(
    addresses.paymentTokenAddress
  );

  const puzzleContract: SLCore = puzzleContractFactory.attach(
    addresses.puzzleAddress
  );
  const factoryContract: Factory = factoryFactory.attach(
    addresses.factoryAddress
  );

  console.log("deploying new investment contract... ");
  await factoryContract.deployNew(100000, addresses.paymentTokenAddress, 1);

  const investmentAddress = await factoryContract.getLastDeployedContract(1);

  console.log("Investment 2 address: ", investmentAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
