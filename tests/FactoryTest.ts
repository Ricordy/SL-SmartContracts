import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  CoinTest,
  CoinTest__factory,
  Factory,
  Factory__factory,
  Investment,
  Investment__factory,
} from "../typechain-types";

const INVESTMENT_1_AMOUNT: Number = 100000;
const INVESTMENT_2_AMOUNT: Number = 150000;

describe("Factory Contract Tests", async () => {
  let paymentTokenContract: CoinTest,
    investmentContract: Investment,
    factoryContract: Factory,
    accounts: SignerWithAddress[];

  beforeEach("", async () => {
    accounts = await ethers.getSigners();
    const [owner, investor1, investor2] = accounts,
      investmentContractFactory = new Factory__factory(owner),
      paymentTokenFactory = new CoinTest__factory(owner);

    factoryContract = await investmentContractFactory.deploy();
    await investmentContract.deployed();
    paymentTokenContract = await paymentTokenFactory.deploy();
    await paymentTokenContract.deployed();

    //uint256 _totalInvestment, address lgentry, address stableContractAddress)
  });
  // it("", async () => {
  //   return true;
  // });
});
