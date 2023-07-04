import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { Address } from "wagmi";
import addresses from "../utils/addresses";
import {
  CoinTest,
  CoinTest__factory,
  Factory,
  Factory__factory,
  Investment,
  Investment__factory,
} from "../typechain-types";

const investmentValue: number = 6000;

async function main() {
  //const accounts: SignerWithAddress[] = await ethers.getSigners();
  const ceo: SignerWithAddress = await ethers.getSigner(
    "0xC2Fab2A52DaAe5213c5060800Bf03176818c86c9"
  );
  //const firstInvestor: SignerWithAddress = accounts[1];

  const paymentTokenFactory = await ethers.getContractFactory("CoinTest");
  const factoryContractFactory = await ethers.getContractFactory("Factory");
  const investmentFactory = await ethers.getContractFactory("Investment");

  const paymentTokenContract: CoinTest = paymentTokenFactory.attach(
    addresses.paymentTokenAddress
  );

  const factoryContract: Factory = factoryContractFactory.attach(
    addresses.factoryAddress
  );
  console.log("Deploying investment contract.....");
  await factoryContract
    .connect(ceo)
    .deployNew(100000, addresses.paymentTokenAddress, 1);

  console.log("Getting last investment contract address.....");
  const investmentAddress = await factoryContract.getLastDeployedContract(1);

  console.log("Investment address:", investmentAddress);
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
    "Approving 10K tokens to be spend by Investment Contract from Investor1: "
  );
  await paymentTokenContract
    .connect(ceo)
    .approve(investmentAddress, valueWithDecimals);
  console.log(`Investing ${investmentValue}...`);
  await investmentContract.connect(ceo).invest(investmentValue);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
