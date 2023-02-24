import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import {
  CoinTest,
  CoinTest__factory,
  Factory,
  Factory__factory,
  Puzzle,
  Puzzle__factory,
  Investment,
  Investment__factory,
} from "../typechain-types";

const INVESTMENT_AMOUNT_1 = 100000;
const INVESTMENT_AMOUNT_2 = 250000;
const INVESTMENT_AMOUNT_3 = 300000;

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner: SignerWithAddress = accounts[0];

  const paymentTokenFactory = new CoinTest__factory(owner);
  const factoryContractFactory = new Factory__factory(owner);
  const puzzleContractFactory = new Puzzle__factory(owner);
  const investmentFactory = new Investment__factory(owner);

  const paymentTokenContract: CoinTest = await paymentTokenFactory.deploy();

  const factoryContract: Factory = await factoryContractFactory.deploy();
  const puzzleContract: Puzzle = await puzzleContractFactory.deploy(
    factoryContract.address,
    paymentTokenContract.address
  );
  // Set entry address
  const setEntryTx = await factoryContract.setEntryAddress(
    puzzleContract.address
  );
  const deployNewTx = await factoryContract.deployNew(
    INVESTMENT_AMOUNT_1,
    paymentTokenContract.address
  );
  const deployedInvestmentAddress1 =
    await factoryContract.getLastDeployedContract();

  const deployNewTx2 = await factoryContract.deployNew(
    INVESTMENT_AMOUNT_2,
    paymentTokenContract.address
  );
  const deployedInvestmentAddress2 =
    await factoryContract.getLastDeployedContract();
  const deployNewTx3 = await factoryContract.deployNew(
    INVESTMENT_AMOUNT_3,
    paymentTokenContract.address
  );
  const deployedInvestmentAddress3 =
    await factoryContract.getLastDeployedContract();
  // const investmentContract: Investment = await investmentFactory.deploy(
  //   100000,
  //   puzzleContract.address,
  //   paymentTokenContract.address
  // );
  // const investmentContract2: Investment = await investmentFactory.deploy(
  //   250000,
  //   puzzleContract.address,
  //   paymentTokenContract.address
  // );
  console.log(
    "Payment Token address deployed at: ",
    paymentTokenContract.address
  );
  console.log("Puzzle deployed at: ", puzzleContract.address);
  console.log("Factory deployed at: ", factoryContract.address);
  console.log("Investment 1 deployed at: ", deployedInvestmentAddress1);
  console.log("Investment 2 deployed at: ", deployedInvestmentAddress2);
  console.log("Investment 3 deployed at: ", deployedInvestmentAddress3);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
