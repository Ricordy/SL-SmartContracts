import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { Address } from "wagmi";

import {
  CoinTest,
  CoinTest__factory,
  Factory,
  Factory__factory,
  Puzzle,
  Puzzle__factory,
  Investment,
  Investment__factory,
} from "../typechain-types";

const paymentTokenAddress: Address =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  investmentAddress: Address = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  puzzleAddress: Address = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  factoryAddress: Address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  investmentValue: number = 1000;

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const owner: SignerWithAddress = accounts[0];
  const firstInvestor: SignerWithAddress = accounts[1];

  const paymentTokenFactory = new CoinTest__factory(owner);
  const puzzleContractFactory = new Puzzle__factory(owner);
  const factoryFactory = new Factory__factory(owner);

  const paymentTokenContract: CoinTest =
    paymentTokenFactory.attach(paymentTokenAddress);

  const puzzleContract: Puzzle = puzzleContractFactory.attach(puzzleAddress);

  const decimals = await paymentTokenContract.decimals();
  // console.log(decimals);

  const valueWithDecimals = ethers.utils.parseUnits(
    investmentValue.toString(),
    decimals
  );
  console.log("Minting 10K tokens to Investor1: ");
  await paymentTokenContract.connect(firstInvestor).mint(valueWithDecimals);
  console.log(
    "Approving 10K tokens to be spend by Puzzle and Investment Contract from Investor1: "
  );
  const approveTx = await paymentTokenContract
    .connect(firstInvestor)
    .approve(puzzleAddress, valueWithDecimals);
  approveTx.wait();
  // await paymentTokenContract
  //   .connect(firstInvestor)
  //   .approve(investmentAddress, investmentValue);
  console.log("Minting entry for Investor1: ");
  await puzzleContract.connect(firstInvestor).mintEntry();
  // const factoryContract = await factoryFactory.attach(factoryAddress);
  // const deployed = await factoryContract.deployedContracts(0);
  // console.log(deployed);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
