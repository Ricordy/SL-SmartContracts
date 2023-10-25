import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import addresses from "../utils/addresses";

import {
  CoinTest,
  CoinTest__factory,
  Factory,
  Factory__factory,
  Investment,
  Investment__factory,
} from "../typechain-types";

/**
 * To run this script, you fist need to run:
 *    - yarn bc
 *    - yarn deploy
 *    - yarn mint
 *    - yarn mintPuzzle
 *    - yarn mintPuzzle2
 */

const investmentValue: number = 15000;

async function main() {
  const ceo: SignerWithAddress = await ethers.getSigner(
    process.env.CEO_ADDRESS as string
  );

  const paymentTokenFactory = new CoinTest__factory(ceo);
  const factoryFactory = new Factory__factory(ceo);
  const investmentFactory = new Investment__factory(ceo);

  const paymentTokenContract: CoinTest = paymentTokenFactory.attach(
    addresses.paymentTokenAddress0
  );

  const factoryContract: Factory = factoryFactory.attach(
    addresses.factoryAddress
  );
  console.log("Deploying investment level 2 contract.....");
  await factoryContract.deployNew(
    1500000,
    addresses.paymentTokenAddress0,
    addresses.paymentTokenAddress1,
    3
  );

  console.log(
    "----------------------------------------------------------------------------------------"
  );

  console.log("Getting last investment contract address.....");

  const investmentAddress = await factoryContract.getLastDeployedContract(3);
  console.log("Investment address:", investmentAddress);
  console.log(
    "----------------------------------------------------------------------------------------"
  );

  const investmentContract: Investment =
    investmentFactory.attach(investmentAddress);

  const decimals = await paymentTokenContract.decimals();

  const valueWithDecimals = ethers.utils.parseUnits(
    investmentValue.toString(),
    decimals
  );
  console.log("Minting 10K tokens to Investor1: ");
  await paymentTokenContract.connect(ceo).mint(valueWithDecimals);
  console.log(
    "----------------------------------------------------------------------------------------"
  );
  console.log(
    "Approving 10K tokens to be spend by Investment Contract from Investor1: "
  );
  await paymentTokenContract
    .connect(ceo)
    .approve(investmentAddress, valueWithDecimals);
  console.log(`Investing ${investmentValue}...`);
  console.log(
    "----------------------------------------------------------------------------------------"
  );
  await investmentContract.connect(ceo).invest(investmentValue, 0);
  console.log(`Invested ${investmentValue}$.`);
  console.log(
    "----------------------------------------------------------------------------------------"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
