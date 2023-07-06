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
  // const ceo: SignerWithAddress = await ethers.getSigner(
  //   "0xC2Fab2A52DaAe5213c5060800Bf03176818c86c9"
  // );

  // const ceo: SignerWithAddress = await ethers.getSigner(
  //   "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  // );

  const ceo: SignerWithAddress = await ethers.getSigner(
    "0xC2Fab2A52DaAe5213c5060800Bf03176818c86c9"
  );

  //const firstInvestor: SignerWithAddress = accounts[1];

  const paymentTokenFactory = await ethers.getContractFactory("CoinTest");
  const factoryContractFactory = await ethers.getContractFactory("Factory");
  const investmentFactory = await ethers.getContractFactory("Investment");

  const paymentTokenContract0: CoinTest = paymentTokenFactory.attach(
    addresses.paymentTokenAddress0
  );

  const paymentTokenContract1: CoinTest = paymentTokenFactory.attach(
    addresses.paymentTokenAddress1
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

  console.log("Getting last investment contract address.....");
  const investmentAddress = await factoryContract.getLastDeployedContract(1);

  console.log("Investment address:", investmentAddress);
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
    "Approving 10K tokens to be spend by Investment Contract from Investor1: "
  );
  await paymentTokenContract0
    .connect(ceo)
    .approve(investmentAddress, valueWithDecimals);
  console.log(`Investing ${investmentValue}...`);
  await investmentContract.connect(ceo).invest(investmentValue, 0);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
