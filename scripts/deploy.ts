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
  SLPermissions__factory,
} from "../typechain-types";
import { log } from "console";
import { Address } from "wagmi";

const ENTRY_BATCH_CAP = 1000,
  ENTRY_BATCH_PRICE = 100,
  ENTRY_TOKEN_URI = "TOKEN_URI",
  TOTAL_INVESTMENT_LEVEL1 = 1000000,
  ACCOUNT = "0xC2Fab2A52DaAe5213c5060800Bf03176818c86c9" as Address;

async function main() {
  // const accounts: SignerWithAddress[] = await ethers.getSigners();
  // const ceo: SignerWithAddress = accounts[0];
  // const cfo: SignerWithAddress = accounts[10];

  const ACCOUNT_SIGNED = await ethers.getSigner(ACCOUNT);

  const paymentTokenContractFactory = await ethers.getContractFactory(
    "CoinTest"
  );
  //const paymentTokenContractFactory = new CoinTest__factory(ceo);
  //const permissionsContractFacotry = new SLPermissions__factory(ceo);
  const permissionsContractFacotry = await ethers.getContractFactory(
    "SLPermissions"
  );
  const puzzleContractFactory = await ethers.getContractFactory("SLCore");
  const logicsContractFactory = await ethers.getContractFactory("SLLogics");
  const factoryContractFactory = await ethers.getContractFactory("Factory");

  // Deploy PaymentToken (CoinTest) contract from the factory
  let paymentTokenContract0 = await paymentTokenContractFactory.deploy();
  await paymentTokenContract0.deployed();
  let paymentTokenContract1 = await paymentTokenContractFactory.deploy();
  await paymentTokenContract1.deployed();

  console.log("Deployed payment token");

  // Deploy PaymentToken (CoinTest) contract from the factory
  let permissionsContract = await permissionsContractFacotry.deploy(
    ACCOUNT,
    ACCOUNT
  );

  console.log("Deployed permissions");

  await permissionsContract.deployed();

  // Deploy Factory contract from the factory
  let factoryContract = await factoryContractFactory.deploy(
    permissionsContract.address
  );
  await factoryContract.deployed();

  console.log("Deployed factory");
  //Deploy SLLogics contract
  let logcisContract = await logicsContractFactory.deploy(
    factoryContract.address,
    paymentTokenContract0.address,
    permissionsContract.address
  );
  await logcisContract.deployed();

  console.log("Deployed logics");
  // Deploy Puzzle contract from the factory passing Factory and logics deployed contract addresses
  let puzzleContract = await puzzleContractFactory.deploy(
    logcisContract.address,
    permissionsContract.address
  );
  await puzzleContract.deployed();

  console.log("Deployed SLCore");
  // Set the Puzzle contract deployed as entry address on Factory contract
  await factoryContract
    .connect(ACCOUNT_SIGNED)
    .setSLCoreAddress(puzzleContract.address);
  console.log("setted slcore address");
  // Allow SLCore to make changes in SLLogics
  await permissionsContract
    .connect(ACCOUNT_SIGNED)
    .setAllowedContracts(puzzleContract.address, 1);

  console.log("setted slcore as allowed");

  // Create a new entry batch
  await puzzleContract
    .connect(ACCOUNT_SIGNED)
    .generateNewEntryBatch(ENTRY_BATCH_CAP, ENTRY_BATCH_PRICE, ENTRY_TOKEN_URI);
  // Deploy Investment contract from the factory
  // let investmentContract = await factoryContract.deployNew(TOTAL_INVESTMENT_LEVEL1,paymentTokenContract.address, 1);
  console.log(
    "----------------------------------------------------------------------------------------"
  );
  console.log("PaymentToken deployed to:", paymentTokenContract0.address);
  console.log("PaymentToken deployed to:", paymentTokenContract1.address);
  console.log(
    "----------------------------------------------------------------------------------------"
  );
  console.log("Permissions deployed to:", permissionsContract.address);
  console.log("CEO: ", ACCOUNT);
  console.log("CFO: ", ACCOUNT);
  console.log(
    "----------------------------------------------------------------------------------------"
  );
  console.log("Factory deployed to:", factoryContract.address);
  console.log(
    "----------------------------------------------------------------------------------------"
  );
  console.log("SLLogics deployed to:", logcisContract.address);
  console.log(
    "----------------------------------------------------------------------------------------"
  );
  console.log("Puzzle deployed to:", puzzleContract.address);
  // console.log("Investment deployed to:", await factoryContract.getLastDeployedContract(1));
  console.log(
    "Entry batch created with cap:",
    ENTRY_BATCH_CAP,
    "price:",
    ENTRY_BATCH_PRICE,
    "and tokenURI:",
    ENTRY_TOKEN_URI
  );
  console.log(
    "----------------------------------------------------------------------------------------"
  );
  console.log(
    ACCOUNT,
    "  is ceo>>>>>>>>",
    await permissionsContract.isCEO(ACCOUNT)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
