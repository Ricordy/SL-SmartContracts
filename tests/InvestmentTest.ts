import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { beforeEach } from "node:test";
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

const INVESTMENT_1_AMOUNT = 100000,
  INVESTMENT_2_AMOUNT: Number = 150000,
  STATUS_PAUSE = 0,
  STATUS_PROGRESS = 1,
  STATUS_PROCESS = 2,
  STATUS_WITHDRAW = 3,
  STATUS_REFUNDING = 4;

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
});
