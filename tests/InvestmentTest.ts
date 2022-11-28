import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  CoinTest,
  Factory,
  Factory__factory,
  Investment,
  Puzzle,
  Puzzle__factory,
} from "../typechain-types";
import { Investment__factory } from "../typechain-types/factories/contracts/Investment__factory";
import { CoinTest__factory } from "../typechain-types/factories/contracts/CoinTest__factory";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const INVESTMENT_1_AMOUNT = 100000,
      INVESTMENT_2_AMOUNT: Number = 150000,
      STATUS_PAUSE = 0,
      STATUS_PROGRESS = 1,
      STATUS_PROCESS = 2,
      STATUS_WITHDRAW = 3,
      STATUS_REFUNDING = 4,
      INVESTOR1_AMOUNT = 10000,
      LESS_THAN_EXPECTED_INV_AMOUNT = 99,
      MORE_THAN_EXPECTED_INV_AMOUNT = INVESTMENT_1_AMOUNT / 2,
      EXPECTED_INV_AMOUNT1 = INVESTMENT_1_AMOUNT / 2;

describe("Investment Contract Tests", async () => {
  let investmentContract: Investment,
    paymentTokenContract: CoinTest,
    factoryContract: Factory,
    puzzleContract: Puzzle,
    accounts: SignerWithAddress[],
    owner: SignerWithAddress,
    investor1: SignerWithAddress,
    investor2: SignerWithAddress;

  async function deployContractFixture() {
    accounts = await ethers.getSigners();
    [owner, investor1, investor2] = accounts;
    const paymentTokenContractFactory = new CoinTest__factory(owner);
    const investmentContractFactory = new Investment__factory(owner);
    const factoryContractFactory = new Factory__factory(owner);
    const puzzleContractFactory = new Puzzle__factory(owner);

    // Deploy PaymentToken (CoinTest) contract from the factory
    paymentTokenContract = await paymentTokenContractFactory.deploy();
    await paymentTokenContract.deployed();

    // Deploy Factory contract from the factory
    factoryContract = await factoryContractFactory.deploy();
    await factoryContract.deployed();
    // Deploy Puzzle contract from the factory passing Factory and PaymentToken deployed contract addresses
    puzzleContract = await puzzleContractFactory.deploy(
      factoryContract.address,
      paymentTokenContract.address
    );
    await puzzleContract.deployed();

    investmentContract = await investmentContractFactory.deploy(
      INVESTMENT_1_AMOUNT,
      puzzleContract.address,
      paymentTokenContract.address
    );
    return {
      owner,
      investor1,
      investor2,
      paymentTokenContract,
      puzzleContract,
      factoryContract,
      investmentContract,
    };
  }

  async function userApprovedTokenToSpend(){
    const {investor1, investmentContract, paymentTokenContract, puzzleContract} = await loadFixture(deployContractFixture);
    await paymentTokenContract.connect(investor1).mint(INVESTOR1_AMOUNT)
    await paymentTokenContract.connect(investor1).approve(investmentContract.address, INVESTOR1_AMOUNT);
    await paymentTokenContract.connect(investor1).approve(puzzleContract.address, INVESTOR1_AMOUNT);
    await puzzleContract.connect(investor1).mintEntry()

    return {
      investor1,
      investmentContract,
      paymentTokenContract
    }

  }
  describe("When the contract is deployed", async function () {
    it("Should set the right owner", async () => {
      const { owner, investmentContract } = await loadFixture(
        deployContractFixture
      );
      const contractOwner = await investmentContract.owner();
      await expect(contractOwner).to.be.equal(owner.address);
    });
    it("Should set the total Investment", async () => {
      const { investmentContract } = await loadFixture(deployContractFixture);
      const totalInvestment = await investmentContract.totalInvestment();
      expect(totalInvestment).to.be.equal(INVESTMENT_1_AMOUNT);
    });
    it("Should set the Entry NFT address", async () => {
      const { investmentContract, puzzleContract } = await loadFixture(
        deployContractFixture
      );
      const entryNFTContractAddress =
        await investmentContract.entryNFTAddress();
      expect(entryNFTContractAddress).to.be.equal(puzzleContract.address);
    });
    it("Should set the PaymentToken address", async () => {
      const { paymentTokenContract, investmentContract } = await loadFixture(
        deployContractFixture
      );
      // Get the PaymentToken address from the Puzzle contract
      const paymentTokenAddressFromContract =
        await investmentContract.paymentTokenAddress();
      expect(paymentTokenAddressFromContract).to.be.equal(
        paymentTokenContract.address
      );
    });
    it('Should set the status to "progress"', async () => {
      const { investmentContract } = await loadFixture(deployContractFixture);
      const contractStatus = await investmentContract.state();
      expect(contractStatus).to.be.equal(STATUS_PROGRESS);
    });
  });
  describe("STATUS: PROGRESS", async () => {
    it('Should set the status to "progress"', async () => {
      const { investmentContract } = await loadFixture(deployContractFixture);
      const contractStatus = await investmentContract.state();
      expect(contractStatus).to.be.equal(STATUS_PROGRESS);
    });
    describe("Invest function", async () => {
      it("Investor must have NFTEntry", async () => {
        const { investmentContract, investor1 } = await loadFixture(deployContractFixture);
        await expect(investmentContract.connect(investor1).invest(LESS_THAN_EXPECTED_INV_AMOUNT)).to.be.revertedWith('Not accessible')
      });
      it("Investor should not be allowed to invest less than 100", async () => {
        const { investmentContract, investor1 } = await loadFixture(userApprovedTokenToSpend);
        await expect(investmentContract.connect(investor1).invest(LESS_THAN_EXPECTED_INV_AMOUNT)).to.be.revertedWith('Error')
      });
      it("Investor should not be allowed to invest more than 10% of total investment", async () => {
        const { investmentContract, investor1 } = await loadFixture(userApprovedTokenToSpend);
        await expect(investmentContract.connect(investor1).invest(MORE_THAN_EXPECTED_INV_AMOUNT)).to.be.revertedWith('Error')
      });
      it("Investor should be allowed to invest", async () => {
        const { investmentContract, investor1 } = await loadFixture(userApprovedTokenToSpend);
        await expect(investmentContract.connect(investor1).invest(EXPECTED_INV_AMOUNT1)).to.emit(investmentContract, "UserInvest").withArgs(investor1.address, EXPECTED_INV_AMOUNT1, anyValue)
      });

    });


  });
});
