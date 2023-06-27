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
  SLCore,
  SLCore__factory,
  SLLogics,
  SLLogics__factory,
  SLPermissions,
  SLPermissions__factory,
} from "../typechain-types";

const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const INVESTMENT_1_AMOUNT = 100000,
  PAYMENT_TOKEN_AMOUNT = 20000,
  CONTRACT_NUMBER_ID = 1,
  ENTRY_BATCH_CAP = 1000,
  ENTRY_BATCH_PRICE = 100,
  INVESTED_LEVEL_1 = 3000,
  INVESTED_LEVEL_2 = 5000,
  INVESTED_LEVEL_3 = 7000,
  ENTRY_TOKEN_URI = "TOKEN_URI";

function withDecimals(toConvert: number) {
  return toConvert * 10 ** 6;
}

describe("Logics Contract Tests", async () => {
  // Variables
  let puzzleContract: SLCore,
    logcisContract: SLLogics,
    paymentTokenContract: CoinTest,
    paymentTokenContract2: CoinTest,
    factoryContract: Factory,
    permissionsContract: SLPermissions,
    totalAccounts: number,
    accounts: SignerWithAddress[],
    owner: SignerWithAddress,
    ceo: SignerWithAddress,
    cfo: SignerWithAddress,
    investor1: SignerWithAddress,
    investor2: SignerWithAddress,
    investor3: SignerWithAddress;

  async function deployContractFixture() {
    // Puzzle contract needs Factory and PaymentToken address to be deployed
    // Get all signers
    accounts = await ethers.getSigners();
    totalAccounts = accounts.length;

    // Assign used accounts from all signers
    [owner, investor1, investor2, investor3] = accounts;
    ceo = accounts[9];
    cfo = accounts[10];
    const paymentTokenContractFactory = new CoinTest__factory(owner);
    const permissionsContractFacotry = new SLPermissions__factory(owner);
    const puzzleContractFactory = new SLCore__factory(owner);
    const logcisContractFactory = new SLLogics__factory(owner);
    const factoryContractFactory = new Factory__factory(owner);
    // Deploy PaymentToken (CoinTest) contract from the factory
    paymentTokenContract = await paymentTokenContractFactory.deploy();
    await paymentTokenContract.deployed();

    // Deploy PaymentToken (CoinTest) contract from the factory
    permissionsContract = await permissionsContractFacotry.deploy(
      ceo.address,
      cfo.address
    );
    await paymentTokenContract.deployed();

    // Deploy Factory contract from the factory
    factoryContract = await factoryContractFactory.deploy(
      permissionsContract.address
    );
    await factoryContract.deployed();
    //Deploy SLLogics contract
    logcisContract = await logcisContractFactory.deploy(
      factoryContract.address,
      paymentTokenContract.address,
      permissionsContract.address
    );
    await logcisContract.deployed();
    // Deploy Puzzle contract from the factory passing Factory and logics deployed contract addresses
    puzzleContract = await puzzleContractFactory.deploy(
      logcisContract.address,
      permissionsContract.address
    );
    await puzzleContract.deployed();
    // Set the Puzzle contract deployed as entry address on Factory contract
    await factoryContract.connect(ceo).setSLCoreAddress(puzzleContract.address);
    // Allow SLCore to make changes in SLLogics
    await permissionsContract
      .connect(ceo)
      .setAllowedContracts(puzzleContract.address, true);
    // Create a new entry batch
    await puzzleContract
      .connect(ceo)
      .generateNewEntryBatch(
        ENTRY_BATCH_CAP,
        ENTRY_BATCH_PRICE,
        ENTRY_TOKEN_URI
      );

    return {
      owner,
      ceo,
      cfo,
      investor1,
      investor2,
      investor3,
      paymentTokenContract,
      puzzleContract,
      factoryContract,
      logcisContract,
    };
  }

  async function ownerAndInvestor1AbleToMintFixture() {
    const { paymentTokenContract, puzzleContract, ceo, cfo, investor1 } =
      await loadFixture(deployContractFixture);
    // Mint PaymentTokens to the owner
    await paymentTokenContract.mint(PAYMENT_TOKEN_AMOUNT);
    // Mint PaymentTokens to the investor1
    await paymentTokenContract.connect(investor1).mint(PAYMENT_TOKEN_AMOUNT);
    // Approve Puzzle contract to spend Owner's PaymentTokens
    await paymentTokenContract.approve(
      logcisContract.address,
      withDecimals(PAYMENT_TOKEN_AMOUNT)
    );
    // Approve Puzzle contract to spend Investor1's PaymentTokens
    await paymentTokenContract
      .connect(investor1)
      .approve(logcisContract.address, withDecimals(PAYMENT_TOKEN_AMOUNT));
    return {
      paymentTokenContract,
      puzzleContract,
      logcisContract,
      ceo,
      cfo,
      investor1,
    };
  }

  describe("Access Control", async () => {
    it("setEntryPrice() should only be called by SLCore", async () => {
      const { logcisContract, puzzleContract, investor1, ceo } =
        await loadFixture(deployContractFixture);

      await puzzleContract
        .connect(ceo)
        .generateNewEntryBatch(
          ENTRY_BATCH_CAP,
          ENTRY_BATCH_PRICE,
          ENTRY_TOKEN_URI
        );
      let currentEntryPrice = await logcisContract._getEntryPrice();

      await expect(
        logcisContract.connect(investor1).setEntryPrice(1000, "testing")
      ).to.be.reverted;

      await puzzleContract
        .connect(ceo)
        .generateNewEntryBatch(
          ENTRY_BATCH_CAP,
          ENTRY_BATCH_PRICE + 100,
          ENTRY_TOKEN_URI
        );
      let newEntryPrice = await logcisContract._getEntryPrice();

      expect(currentEntryPrice).to.not.be.equal(newEntryPrice);
    });
    it("payEntryFee() must only be called by SLCore", async () => {
      const { logcisContract, paymentTokenContract, investor1, ceo, cfo } =
        await loadFixture(ownerAndInvestor1AbleToMintFixture);

      await puzzleContract
        .connect(ceo)
        .generateNewEntryBatch(
          ENTRY_BATCH_CAP,
          ENTRY_BATCH_PRICE,
          ENTRY_TOKEN_URI
        );
      await expect(
        logcisContract.connect(investor1).payEntryFee(investor1.address)
      ).to.be.reverted;

      await expect(puzzleContract.connect(investor1).mintEntry()).to.not.be
        .reverted;
    });

    it("only contract owner(or assigned CEO) can withdraw tokens", async () => {
      const { logcisContract, paymentTokenContract, investor1 } =
        await loadFixture(deployContractFixture);

      await expect(
        logcisContract.connect(investor1).withdrawTokens(investor1.address)
      ).to.be.reverted;

      await expect(logcisContract.connect(cfo).withdrawTokens(owner.address)).to
        .not.be.reverted;
    });
  });

  describe("Token Transfer", async () => {
    it("afetr payEntryFee() contract balance should be previousBalance + entryFee", async () => {
      const { logcisContract, paymentTokenContract, investor1, ceo } =
        await loadFixture(ownerAndInvestor1AbleToMintFixture);

      await puzzleContract
        .connect(ceo)
        .generateNewEntryBatch(
          ENTRY_BATCH_CAP,
          ENTRY_BATCH_PRICE,
          ENTRY_TOKEN_URI
        );

      let previousBalance = await paymentTokenContract.balanceOf(
        logcisContract.address
      );

      await puzzleContract.connect(investor1).mintEntry();

      let newBalance = await paymentTokenContract.balanceOf(
        logcisContract.address
      );

      expect(newBalance).to.be.equal(previousBalance.add(ENTRY_BATCH_PRICE));
    });
  });
});
