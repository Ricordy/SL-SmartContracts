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

/**
 * STATE VARIABLES
 *
 * Override this variables if you want to change any parameter deploying Something Legendary's contracts
 * @var ENTRY_BATCH_CAP Number of Membership card (entry nft) tokens in the 1st batch.
 * @var ENTRY_BATCH_PRICE Price of each Membership card (entry nft) token in the 1st batch.
 * @var ENTRY_TOKEN_URI The uri for the membership card (entry nft) collection in the 1st batch.
 * @var CEO_ADDRESS Address for the CEO.
 * @var CFO_ADDRESS Address for the CFO.
 *
 * The CEO/CFO addresses are both set to account #0 of hardhat, change this values if deploying to testnet.
 */
const ENTRY_BATCH_CAP = 1000,
  ENTRY_BATCH_PRICE = 100,
  ENTRY_TOKEN_URI = "TOKEN_URI",
  CEO_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" as any,
  CFO_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" as any;

/**
 * Script function
 */
async function main() {
  const CEO_SIGNED = await ethers.getSigner(CEO_ADDRESS),
    CFO_SIGNED = await ethers.getSigner(CEO_ADDRESS);

  //Get all the factories
  const paymentTokenContractFactory = await ethers.getContractFactory(
    "CoinTest"
  );
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

  console.log("1. Deployed payment tokens");

  // Deploy SLPermissions contract from the factory
  let permissionsContract = await permissionsContractFacotry.deploy(
    CEO_ADDRESS,
    CFO_ADDRESS
  );

  console.log("2. Deployed SLPermissions");

  await permissionsContract.deployed();

  // Deploy Factory contract from the factory
  let factoryContract = await factoryContractFactory.deploy(
    permissionsContract.address
  );
  await factoryContract.deployed();

  console.log("3. Deployed Factory");
  //Deploy SLLogics contract
  let logcisContract = await logicsContractFactory.deploy(
    factoryContract.address,
    paymentTokenContract0.address,
    permissionsContract.address
  );
  await logcisContract.deployed();

  console.log("4. Deployed SLLogics");
  // Deploy Puzzle contract from the factory passing Factory and logics deployed contract addresses
  let puzzleContract = await puzzleContractFactory.deploy(
    logcisContract.address,
    permissionsContract.address
  );
  await puzzleContract.deployed();

  console.log("5. Deployed SLCore");
  // Set the Puzzle contract deployed as entry address on Factory contract
  await factoryContract
    .connect(CEO_SIGNED)
    .setSLCoreAddress(puzzleContract.address);
  console.log("6. Automated call: Setted slcore address in Factory contract.");
  // Allow SLCore to make changes in SLLogics
  await permissionsContract
    .connect(CEO_SIGNED)
    .setAllowedContracts(puzzleContract.address, 1);

  console.log(
    "6. Automated call: Setted slcore as allowedContract in SLPermissions"
  );

  // Create a new entry batch
  await puzzleContract
    .connect(CEO_SIGNED)
    .generateNewEntryBatch(ENTRY_BATCH_CAP, ENTRY_BATCH_PRICE, ENTRY_TOKEN_URI);

  console.log("7. Automated call: Deployed the first entry btach");

  console.log(
    "----------------------------------------------------------------------------------------"
  );
  console.log("PaymentToken deployed to:", paymentTokenContract0.address);
  console.log("PaymentToken deployed to:", paymentTokenContract1.address);
  console.log(
    "----------------------------------------------------------------------------------------"
  );
  console.log("Permissions deployed to:", permissionsContract.address);
  console.log("CEO: ", CEO_ADDRESS);
  console.log("CFO: ", CFO_ADDRESS);
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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
