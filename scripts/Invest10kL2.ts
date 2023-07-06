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

const investmentValue: number = 10000;

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner: SignerWithAddress = accounts[0];
  const firstInvestor: SignerWithAddress = accounts[1];

  const paymentTokenFactory = new CoinTest__factory(owner);
  const factoryFactory = new Factory__factory(owner);
  const investmentFactory = new Investment__factory(owner);

  const paymentTokenContract: CoinTest = paymentTokenFactory.attach(
    addresses.paymentTokenAddress0
  );

  const factoryContract: Factory = factoryFactory.attach(
    addresses.factoryAddress
  );

  await factoryContract.deployNew(
    100000,
    addresses.paymentTokenAddress0,
    addresses.paymentTokenAddress1,
    2
  );

  const investmentAddress = await factoryContract.getLastDeployedContract(2);

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
  await investmentContract.connect(firstInvestor).invest(investmentValue, 0);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
