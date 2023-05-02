import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import {
  CoinTest,
  CoinTest__factory,
  Factory,
  Factory__factory,
  Investment,
  Investment__factory,
  SLCore,
  SLCore__factory,
  SLLogics__factory,
} from "../typechain-types";

const ENTRY_BATCH_CAP = 1000,
      ENTRY_BATCH_PRICE = 100,
      ENTRY_TOKEN_URI = "TOKEN_URI";

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner: SignerWithAddress = accounts[0];

  const paymentTokenContractFactory = new CoinTest__factory(owner);
  const puzzleContractFactory = new SLCore__factory(owner);
  const logicsContractFactory = new SLLogics__factory(owner);
  const factoryContractFactory = new Factory__factory(owner);

  // Deploy PaymentToken (CoinTest) contract from the factory
  let paymentTokenContract = await paymentTokenContractFactory.deploy();
  await paymentTokenContract.deployed();

  // Deploy Factory contract from the factory
  let factoryContract = await factoryContractFactory.deploy();
  await factoryContract.deployed();

  await factoryContract.deployed();
  //Deploy SLLogics contract
  let logcisContract = await logicsContractFactory.deploy(
    factoryContract.address,
    paymentTokenContract.address
  );
  await logcisContract.deployed();
  // Deploy Puzzle contract from the factory passing Factory and PaymentToken deployed contract addresses
  let puzzleContract = await puzzleContractFactory.deploy(
    factoryContract.address,
    logcisContract.address
  );
  await puzzleContract.deployed();
  // Set the Puzzle contract deployed as entry address on Factory contract
  await factoryContract.setEntryAddress(puzzleContract.address);
  // Allow SLCore to make changes in SLLogics
  await logcisContract.setAllowedContracts(puzzleContract.address, true);
  // Create a new entry batch
  await puzzleContract.generateNewEntryBatch(ENTRY_BATCH_CAP, ENTRY_BATCH_PRICE, ENTRY_TOKEN_URI);

  console.log("PaymentToken deployed to:", paymentTokenContract.address);
  console.log("Factory deployed to:", factoryContract.address);
  console.log("SLLogics deployed to:", logcisContract.address);
  console.log("Puzzle deployed to:", puzzleContract.address);
  console.log("Entry batch created with cap:", ENTRY_BATCH_CAP, "price:", ENTRY_BATCH_PRICE, "and tokenURI:", ENTRY_TOKEN_URI);
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
