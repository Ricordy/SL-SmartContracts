import { ethers } from "hardhat";
import addresses from "../utils/addresses";
import { Factory } from "../typechain-types";

const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS ?? addresses.factoryAddress;
const PAYMENT_TOKEN_ADDRESS_1 =
  process.env.PAYMENT_TOKEN_ADDRESS_1 ?? addresses.paymentTokenAddress0;
const PAYMENT_TOKEN_ADDRESS_2 =
  process.env.PAYMENT_TOKEN_ADDRESS_2 ?? addresses.paymentTokenAddress1;
const PERMISSIONS_ADDRESS =
  process.env.PERMISSIONS_ADDRESS ?? addresses.permissionsAddress;
const LOGICS_ADDRESS = process.env.LOGICS_ADDRESS ?? addresses.logicsAddress;
const PUZZLE_ADDRESS = process.env.PUZZLE_ADDRESS ?? addresses.puzzleAddress;

async function main() {
  const factoryContractFactory = await ethers.getContractFactory("Factory");
  const factoryContract: Factory =
    factoryContractFactory.attach(FACTORY_ADDRESS);

  console.log("Deploying new investment contract... ");
  await factoryContract.deployNew(
    100_000,
    PAYMENT_TOKEN_ADDRESS_1,
    PAYMENT_TOKEN_ADDRESS_2,
    1
  );

  const investmentAddress = await factoryContract.getLastDeployedContract(1);

  console.log(
    "----------------------------------------------------------------------------------------"
  );

  console.log("Investment level 1 deployed to: ", investmentAddress);
  console.log("Total investment: 100.000 €.  ");
  console.log("Payment token 1 address: ", PAYMENT_TOKEN_ADDRESS_1);
  console.log("Payment token 2 address: ", PAYMENT_TOKEN_ADDRESS_2);

  console.log(
    "----------------------------------------------------------------------------------------"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
