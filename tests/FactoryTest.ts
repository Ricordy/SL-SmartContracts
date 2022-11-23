import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { beforeEach } from "node:test";
import { Factory, Investment } from "../typechain-types";
import { Investment__factory } from "../typechain-types/factories/contracts/Investment__factory";

const INVESTMENT_1_AMOUNT: Number = 100000;
const INVESTMENT_2_AMOUNT: Number = 150000;

describe("Factory Contract Tests", async () => {
  let investmentContract: Investment;
  let factoryContract: Factory;
  let accounts: SignerWithAddress[];

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    const [owner, investor1, investor2] = accounts;
    const investmentContractFactory = new Investment__factory(owner);

    //uint256 _totalInvestment, address lgentry, address stableContractAddress)
  });
});
