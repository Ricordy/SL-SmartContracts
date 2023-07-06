import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { Address } from "wagmi";
import addresses from "../utils/addresses";

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

const investmentValue: number = 1000;

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner: SignerWithAddress = accounts[0];
  const firstInvestor: SignerWithAddress = accounts[1];

  const paymentTokenFactory = new CoinTest__factory(owner);
  const puzzleContractFactory = new SLCore__factory(owner);
  const factoryFactory = new Factory__factory(owner);

  const paymentTokenContract: CoinTest = paymentTokenFactory.attach(
    addresses.paymentTokenAddress0
  );

  const puzzleContract: SLCore = puzzleContractFactory.attach(
    addresses.puzzleAddress
  );

  const decimals = await paymentTokenContract.decimals();
  // console.log(decimals);

  const valueWithDecimals = ethers.utils.parseUnits(
    investmentValue.toString(),
    decimals
  );
  console.log("Minting 10K tokens to Investor1: ");
  await paymentTokenContract.mint(valueWithDecimals);
  console.log(
    "Approving 10K tokens to be spend by Puzzle and Investment Contract from Investor1: "
  );
  const approveTx = await paymentTokenContract.approve(
    addresses.logicsAddress,
    valueWithDecimals
  );
  approveTx.wait();
  // await paymentTokenContract
  //   .connect(firstInvestor)
  //   .approve(investmentAddress, investmentValue);
  console.log("Minting entry for Investor1: ");
  await puzzleContract.mintEntry();
  // const factoryContract = await factoryFactory.attach(factoryAddress);
  // const deployed = await factoryContract.deployedContracts(0);
  // console.log(deployed);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
