import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { Address } from "wagmi";

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

const paymentTokenAddress: Address =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  investmentAddress: Address = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  puzzleAddress: Address = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  factoryAddress: Address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  sllogicsAddress: Address = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  investmentValue: number = 100000;

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner: SignerWithAddress = accounts[0];
  const firstInvestor: SignerWithAddress = accounts[1];

  const paymentTokenFactory = new CoinTest__factory(owner);
  const puzzleContractFactory = new SLCore__factory(owner);
  const factoryFactory = new Factory__factory(owner);
  const investmentFactory = new Investment__factory(owner);

  const factoryContract: Factory = factoryFactory.attach(factoryAddress);

  await factoryContract.deployNew(1000000, paymentTokenAddress, 2);

  const puzzleContract: SLCore = puzzleContractFactory.attach(puzzleAddress);

  console.log("Minting puzzle pieces for Investor1: ");
  const mintTx = await puzzleContract.connect(firstInvestor).mintTest(2);
  mintTx.wait(1);

  const investmentAddress = await factoryContract.getLastDeployedContract(2);

  const paymentTokenContract: CoinTest =
    paymentTokenFactory.attach(paymentTokenAddress);

  const investmentContract: Investment =
    investmentFactory.attach(investmentAddress);

  const decimals = await paymentTokenContract.decimals();

  const valueWithDecimals = ethers.utils.parseUnits(
    investmentValue.toString(),
    decimals
  );
  console.log("Minting 10K tokens to Investor1: ");
  await paymentTokenContract.connect(firstInvestor).mint(valueWithDecimals);
  console.log(
    "Approving 10K tokens to be spend by Investment Contract from Investor1: "
  );
  await paymentTokenContract
    .connect(firstInvestor)
    .approve(investmentAddress, valueWithDecimals);
  console.log(`Investing ${investmentValue}...`);
  await investmentContract.connect(firstInvestor).invest(investmentValue);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
