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

  const paymentTokenFactory = await ethers.getContractFactory("CoinTest");
  //const paymentTokenContractFactory = new CoinTest__factory(ceo);
  //const permissionsContractFacotry = new SLPermissions__factory(ceo);
  const puzzleContractFactory = await ethers.getContractFactory("SLCore");
  const factoryContractFactory = await ethers.getContractFactory("Factory");

  const paymentTokenContract: CoinTest = paymentTokenFactory.attach(
    addresses.paymentTokenAddress
  );

  const puzzleContract: SLCore = puzzleContractFactory.attach(
    addresses.puzzleAddress
  );
  const factoryContract: Factory = factoryContractFactory.attach(
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
