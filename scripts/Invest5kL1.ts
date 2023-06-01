import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { Address } from "wagmi";

import {
  CoinTest,
  CoinTest__factory,
  Factory,
  Factory__factory,
  Investment,
  Investment__factory,
} from "../typechain-types";

const paymentTokenAddress: Address =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  factoryAddress: Address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  investmentValue: number = 6000;

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner: SignerWithAddress = accounts[0];
  const firstInvestor: SignerWithAddress = accounts[1];

  const paymentTokenFactory = new CoinTest__factory(owner);
  const factoryFactory = new Factory__factory(owner);
  const investmentFactory = new Investment__factory(owner);

  const paymentTokenContract: CoinTest =
    paymentTokenFactory.attach(paymentTokenAddress);

  const factoryContract: Factory = factoryFactory.attach(factoryAddress);

  await factoryContract.deployNew(100000, paymentTokenAddress, 1);

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
  await paymentTokenContract.connect(firstInvestor).mint(valueWithDecimals);
  console.log(
    "Approving 10K tokens to be spend by Investment Contract from Investor1: "
  );
  await paymentTokenContract
    .connect(firstInvestor)
    .approve(investmentAddress, valueWithDecimals);
  console.log(`Investing ${investmentValue}...`);
  await investmentContract.connect(firstInvestor).invest(investmentValue);
  console.log(await investmentContract.investors());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
