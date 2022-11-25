import {
  CoinTest,
  CoinTest__factory,
  Factory,
  Factory__factory,
  Investment__factory,
  Puzzle,
  Puzzle__factory,
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

// Constants
const COLLECTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const PAYMENT_TOKEN_AMOUNT = 20000;
const ENTRY_LEVEL_NFT_ID = 10;
const INVESTMENT1_AMOUNT = 100000;
const INVESTOR1_INVESTMENT_AMOUNT = 6000;

describe("Puzzle Contract", async () => {
  // Variables
  let puzzleContract: Puzzle,
    paymentTokenContract: CoinTest,
    factoryContract: Factory,
    totalAccounts: number,
    accounts: SignerWithAddress[],
    owner: SignerWithAddress,
    investor1: SignerWithAddress,
    investor2: SignerWithAddress,
    investor3: SignerWithAddress,
    ownerBalanceBefore: BigNumber;

  async function deployContractFixture() {
    // Puzzle contract needs Factory and PaymentToken address to be deployed
    // Get all signers
    accounts = await ethers.getSigners();
    totalAccounts = accounts.length;

    // Assign used accounts from all signers
    [owner, investor1, investor2, investor3] = accounts;
    const paymentTokenContractFactory = new CoinTest__factory(owner);
    const puzzleContractFactory = new Puzzle__factory(owner);
    const factoryContractFactory = new Factory__factory(owner);
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
    // Set the Puzzle contract deployed as entry address on Factory contract
    await factoryContract.setEntryAddress(puzzleContract.address);

    return {
      owner,
      investor1,
      investor2,
      investor3,
      paymentTokenContract,
      puzzleContract,
      factoryContract,
    };
  }

  async function mintPaymentTokenFixture() {
    const { paymentTokenContract } = await loadFixture(deployContractFixture);
    await paymentTokenContract.mint(PAYMENT_TOKEN_AMOUNT);
    return { paymentTokenContract };
  }

  async function ownerAbleToMintFixture() {
    const { paymentTokenContract, puzzleContract } = await loadFixture(
      deployContractFixture
    );
    // Mint PaymentTokens to the owner
    await paymentTokenContract.mint(PAYMENT_TOKEN_AMOUNT);
    // Approve Puzzle contract to spend the PaymentTokens
    await paymentTokenContract.approve(
      puzzleContract.address,
      PAYMENT_TOKEN_AMOUNT
    );
    return { paymentTokenContract, puzzleContract };
  }

  async function investor1AbleToMintFixture() {
    const { paymentTokenContract, puzzleContract } = await loadFixture(
      deployContractFixture
    );
    // Mint PaymentTokens to the owner
    await paymentTokenContract.connect(investor1).mint(PAYMENT_TOKEN_AMOUNT);
    // Approve Puzzle contract to spend the PaymentTokens
    await paymentTokenContract
      .connect(investor1)
      .approve(puzzleContract.address, PAYMENT_TOKEN_AMOUNT);
    return { paymentTokenContract, puzzleContract };
  }

  async function investor1DidntApproveSpendFixture() {
    const { paymentTokenContract, puzzleContract } = await loadFixture(
      deployContractFixture
    );
    // Mint PaymentTokens to investor
    await paymentTokenContract.connect(investor1).mint(PAYMENT_TOKEN_AMOUNT);

    return { paymentTokenContract, puzzleContract };
  }

  async function investor1ApprovedSpendFixture() {
    const { paymentTokenContract, puzzleContract } = await loadFixture(
      deployContractFixture
    );
    await paymentTokenContract
      .connect(investor1)
      .approve(puzzleContract.address, PAYMENT_TOKEN_AMOUNT);
    return { paymentTokenContract, puzzleContract };
  }

  async function investor1readyToClaimNFT() {
    const { paymentTokenContract, puzzleContract, factoryContract } =
      await loadFixture(deployContractFixture);

    // Mint PaymentTokens to investor
    await paymentTokenContract.connect(investor1).mint(PAYMENT_TOKEN_AMOUNT);

    await paymentTokenContract
      .connect(investor1)
      .approve(puzzleContract.address, PAYMENT_TOKEN_AMOUNT);

    puzzleContract.connect(investor1).mintEntry();

    const deployNewTx = await factoryContract.deployNew(
      INVESTMENT1_AMOUNT,
      paymentTokenContract.address
    );

    const deployedInvestmentAddress =
      await factoryContract.getLastDeployedContract();
    const investmentFactory = new Investment__factory(owner);
    const investmentContract = investmentFactory.attach(
      deployedInvestmentAddress
    );

    // Allow investment contract to spend
    await paymentTokenContract
      .connect(investor1)
      .approve(investmentContract.address, INVESTOR1_INVESTMENT_AMOUNT);
    // Invest an amount on investment1
    await investmentContract
      .connect(investor1)
      .invest(INVESTOR1_INVESTMENT_AMOUNT);

    return { paymentTokenContract, puzzleContract };
  }

  describe("When the contract is deployed", async function () {
    it("Should set the right owner", async () => {
      const { owner, puzzleContract } = await loadFixture(
        deployContractFixture
      );
      const contractOwner = await puzzleContract.owner();
      await expect(contractOwner).to.be.equal(owner.address);
    });
    it("Should set the max amount for each collection", async () => {
      const { puzzleContract } = await loadFixture(deployContractFixture);
      // Get the MAX_PER_COLLECTION from the Puzzle contract
      const maxPerCollection = await puzzleContract.MAX_PER_COLLECTION();

      COLLECTIONS.map(
        async (collection) =>
          await expect(
            await puzzleContract.getMaxCollection(collection)
          ).to.be.equal(maxPerCollection)
      );
    });
    it("Should set the factory address", async () => {
      const { factoryContract, puzzleContract } = await loadFixture(
        deployContractFixture
      );
      // Get Factory address from the Puzzle contract
      const factoryAddressFromContract = await puzzleContract.factoryAddress();
      expect(factoryAddressFromContract).to.be.equal(factoryContract.address);
    });
    it("Should set the PaymentToken address", async () => {
      const { paymentTokenContract, puzzleContract } = await loadFixture(
        deployContractFixture
      );
      // Get the PaymentToken address from the Puzzle contract
      const paymentTokenAddressFromContract =
        await puzzleContract.paymentTokenAddress();
      expect(paymentTokenAddressFromContract).to.be.equal(
        paymentTokenContract.address
      );
    });
  });
  describe("Pre-minting the entry NFT", async () => {
    it("Owner should have enough payment token to be able to mint", async () => {
      let { paymentTokenContract } = await loadFixture(deployContractFixture);
      // Owner PaymentToken balance before mint
      const ownerPaymentTokenBalanceBefore =
        await paymentTokenContract.balanceOf(owner.address);
      // Mint PaymentToken for the owner
      await loadFixture(mintPaymentTokenFixture);
      // Owner PaymentToken balance after mint
      const ownerPaymentTokenBalanceAfter =
        await paymentTokenContract.balanceOf(owner.address);

      expect(ownerPaymentTokenBalanceAfter).to.be.equal(
        ownerPaymentTokenBalanceBefore.add(PAYMENT_TOKEN_AMOUNT)
      );
    });
    it("Owner should be able to mint if they have enough funds and the funds were approved", async () => {
      const { puzzleContract } = await loadFixture(ownerAbleToMintFixture);

      await expect(await puzzleContract.mintEntry())
        .to.emit(puzzleContract, "Minted")
        .withArgs(ENTRY_LEVEL_NFT_ID, 1);
    });
    it("Investor without allowing to spend funds should not be able to mint", async () => {
      const { puzzleContract } = await loadFixture(
        investor1DidntApproveSpendFixture
      );
      await expect(
        puzzleContract.connect(investor3).mintEntry()
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
    it("Investor with approved token spent but without enough funds should not be able to mint", async () => {
      const { puzzleContract } = await loadFixture(
        investor1ApprovedSpendFixture
      );

      await expect(
        puzzleContract.connect(investor1).mintEntry()
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });
  describe("Minting the entry NFT", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(investor1AbleToMintFixture));
    });
    it("Investor should be able to mint if they have enough funds and the funds were approved", async function () {
      await expect(await puzzleContract.connect(investor1).mintEntry())
        .to.emit(puzzleContract, "Minted")
        .withArgs(ENTRY_LEVEL_NFT_ID, 1);
    });
    it("Investor should have the Entry Level NFT after the mint", async () => {
      await puzzleContract.connect(investor1).mintEntry();
      const investor1HasEntryNFT = await puzzleContract
        .connect(investor1)
        .balanceOf(investor1.address, ENTRY_LEVEL_NFT_ID);
      expect(investor1HasEntryNFT).to.be.eq(1);
    });
    it("Investor should not be able to have more than 1 NFTEntry", async () => {
      await expect(await puzzleContract.connect(investor1).mintEntry()).to.not
        .be.reverted;
      await expect(
        puzzleContract.connect(investor1).mintEntry()
      ).to.be.revertedWith("Cannot have more than 1");
    });
    it("Investors should not be able to mint more than the collection limit", async () => {
      const { paymentTokenContract, puzzleContract } = await loadFixture(
        deployContractFixture
      );
      const maxPerCollection = await puzzleContract.MAX_PER_COLLECTION();

      for (let i = 0; i <= maxPerCollection.toNumber(); i++) {
        await paymentTokenContract
          .connect(accounts[i])
          .mint(PAYMENT_TOKEN_AMOUNT);
        await paymentTokenContract
          .connect(accounts[i])
          .approve(puzzleContract.address, PAYMENT_TOKEN_AMOUNT);
        if (i < maxPerCollection.toNumber()) {
          await puzzleContract.connect(accounts[i]).mintEntry();
        }
      }

      await expect(
        puzzleContract
          .connect(accounts[maxPerCollection.toNumber()])
          .mintEntry()
      ).to.be.revertedWith("Collection limit reached");
    });
  });
  describe("Claim Puzzle NFT", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(investor1readyToClaimNFT));
    });
    it("Investor should be able to call verifyClaim (to claim an NFT Puzzle) after having invested the minimum amount required", async () => {
      const { puzzleContract } = await loadFixture(investor1readyToClaimNFT);

      expect(await puzzleContract.verifyClaim(investor1.address)).to.equal(
        true
      );
    });
    it("Investor should be able to call  claim an NFT Puzzle after having invested the minimum amount required", async () => {
      const { puzzleContract } = await loadFixture(investor1readyToClaimNFT);

      await expect(await puzzleContract.connect(investor1).claim())
        .to.emit(puzzleContract, "Minted")
        .withArgs(anyValue, 1);
    });
  });
});
