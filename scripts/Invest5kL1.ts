import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import addresses from "../utils/addresses";
import { CoinTest, Factory, Investment } from "../typechain-types";

const investmentValue: number = 6000;

/**
 * To run this script, you fist need to run:
 *    - yarn bc
 *    - yarn deploy
 *    - yarn mint
 */

async function main() {
  const ceo: SignerWithAddress = await ethers.getSigner(
    process.env.CEO_ADDRESS as string
  );

  const paymentTokenFactory = await ethers.getContractFactory("CoinTest");
  const factoryContractFactory = await ethers.getContractFactory("Factory");
  const investmentFactory = await ethers.getContractFactory("Investment");

  const paymentTokenContract0: CoinTest = paymentTokenFactory.attach(
    addresses.paymentTokenAddress0
  );

  const factoryContract: Factory = factoryContractFactory.attach(
    addresses.factoryAddress
  );
  console.log("Deploying investment contract.....");
  await factoryContract
    .connect(ceo)
    .deployNew(
      investmentValue * 10,
      addresses.paymentTokenAddress0,
      addresses.paymentTokenAddress1,
      1
    );

  console.log(
    "----------------------------------------------------------------------------------------"
  );
  console.log("Getting last investment contract address.....");
  const investmentAddress = await factoryContract.getLastDeployedContract(1);

  console.log("Investment address:", investmentAddress);
  console.log(
    "----------------------------------------------------------------------------------------"
  );
  const investmentContract: Investment =
    investmentFactory.attach(investmentAddress);

  const decimals = await paymentTokenContract0.decimals();

  const valueWithDecimals = ethers.utils.parseUnits(
    investmentValue.toString(),
    decimals
  );
  console.log("Minting 10K tokens to Investor1: ");
  await paymentTokenContract0.connect(ceo).mint(valueWithDecimals);
  console.log(
    "----------------------------------------------------------------------------------------"
  );
  console.log(
    "Approving 10K tokens to be spend by Investment Contract from Investor1: "
  );

  await paymentTokenContract0
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
