import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { describe } from "mocha";
import {
  CoinTest,
  CoinTest__factory,
  Factory,
  Factory__factory,
  Investment,
  Investment__factory,
  Puzzle,
  Puzzle__factory,
} from "../typechain-types";

const INVESTMENT_1_AMOUNT = 100000;
const INVESTMENT_2_AMOUNT = 150000;

describe("Factory Contract Tests", async () => {
  let paymentTokenContract: CoinTest,
  paymentTokenContract2: CoinTest,
    puzzleContract: Puzzle,
    investmentContract: Investment,
    factoryContract: Factory,
    accounts: SignerWithAddress[];

  async function DeployContracts(){
    accounts = await ethers.getSigners();
    const [owner, investor1, investor2] = accounts,
      investmentContractFactory = new Factory__factory(owner),
      paymentTokenFactory = new CoinTest__factory(owner),
      puzzleContractFactory = new Puzzle__factory(owner);

    factoryContract = await investmentContractFactory.deploy();
    await factoryContract.deployed();
    paymentTokenContract = await paymentTokenFactory.deploy();
    await paymentTokenContract.deployed();
    paymentTokenContract2 = await paymentTokenFactory.deploy();
    await paymentTokenContract2.deployed();
    puzzleContract = await puzzleContractFactory.deploy(factoryContract.address, paymentTokenContract.address);
    await puzzleContract.deployed();

    return{factoryContract, paymentTokenContract, investor1}
    //uint256 _totalInvestment, address lgentry, address stableContractAddress)
  };
  describe('DeployNew function', async () => {
    it("caller must be the owner ", async () => {
      const {factoryContract, paymentTokenContract, investor1} = await loadFixture(DeployContracts);
      await expect(factoryContract.connect(investor1).deployNew(INVESTMENT_1_AMOUNT ,paymentTokenContract.address, paymentTokenContract2.address)).to.be.revertedWith("Ownable: caller is not the owner")
    });
    it("Should create a new Investment contract", async () => {
      return true;
    });
  })
  
});
