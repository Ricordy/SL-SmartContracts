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
const COLLECTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  PAYMENT_TOKEN_AMOUNT = 20000,
  ENTRY_LEVEL_NFT_ID = 10,
  LEVEL2_NFT_ID = 11,
  INVESTMENT1_AMOUNT = 100000,
  INVESTOR1_INVESTMENT_AMOUNT = 6000,
  PAYMENT_TOKEN_ID_0 = 0,
  PAYMENT_TOKEN_ID_1 = 1;

describe("Puzzle Contract", async () => {
  // Variables
  let puzzleContract: Puzzle,
    paymentTokenContract: CoinTest,
    paymentTokenContract2: CoinTest,
    factoryContract: Factory,
    totalAccounts: number,
    accounts: SignerWithAddress[],
    owner: SignerWithAddress,
    investor1: SignerWithAddress,
    investor2: SignerWithAddress,
    investor3: SignerWithAddress,
    ownerBalanceBefore: BigNumber,
    baseUriFromContract: string;

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
    // Deploy PaymentToken (CoinTest2) contract from the factory
    paymentTokenContract2 = await paymentTokenContractFactory.deploy();
    await paymentTokenContract2.deployed();
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

  async function ownerAndInvestor1AbleToMintFixture() {
    const { paymentTokenContract, puzzleContract } = await loadFixture(
      deployContractFixture
    );
    // Mint PaymentTokens to the owner
    await paymentTokenContract.mint(PAYMENT_TOKEN_AMOUNT);
    // Mint PaymentTokens to the investor1
    await paymentTokenContract.connect(investor1).mint(PAYMENT_TOKEN_AMOUNT);
    // Approve Puzzle contract to spend Owner's PaymentTokens
    await paymentTokenContract.approve(
      puzzleContract.address,
      PAYMENT_TOKEN_AMOUNT
    );
    // Approve Puzzle contract to spend Investor1's PaymentTokens
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
      paymentTokenContract.address,
      paymentTokenContract2.address
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
      .invest(INVESTOR1_INVESTMENT_AMOUNT, PAYMENT_TOKEN_ID_0);

    return { paymentTokenContract, puzzleContract };
  }
  async function ownerAndInvestor1ReadyToBurnLevel2NFT() {
    const { paymentTokenContract, puzzleContract } = await loadFixture(
      deployContractFixture
    );
    // Mint PaymentTokens to the owner
    await paymentTokenContract.mint(PAYMENT_TOKEN_AMOUNT);
    // Mint PaymentTokens to the investor1
    await paymentTokenContract.connect(investor1).mint(PAYMENT_TOKEN_AMOUNT);
    // Approve Puzzle contract to spend Owner's PaymentTokens
    await paymentTokenContract.approve(
      puzzleContract.address,
      PAYMENT_TOKEN_AMOUNT
    );
    // Approve Puzzle contract to spend Investor1's PaymentTokens
    await paymentTokenContract
      .connect(investor1)
      .approve(puzzleContract.address, PAYMENT_TOKEN_AMOUNT);
    // Mint Entry NFT for the owner
    await puzzleContract.mintEntry();
    // Mint Entry NFT for the Investor1
    await puzzleContract.connect(investor1).mintEntry();
    // Mint all Puzzle NFTs for the owner
    await puzzleContract.mintTest();
    // Mint all Puzzle NFTs for the investor1
    await puzzleContract.connect(investor1).mintTest();
    return { puzzleContract };
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
    describe("Metadata", async () => {
      beforeEach(async () => {
        ({ puzzleContract } = await loadFixture(deployContractFixture));
        baseUriFromContract = await puzzleContract.base_uri();
      });
      it("Get the right metadata - TO REVIEW", async () => {
        expect(await puzzleContract.tokenURI(1)).to.equal(
          `${baseUriFromContract}/1.json`
        );
      });
      it("Get the right metadata via uri() function  - TO REVIEW", async () => {
        expect(await puzzleContract.uri(1)).to.equal(
          `${baseUriFromContract}/1.json`
        );
      });
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
      ({ puzzleContract } = await loadFixture(
        ownerAndInvestor1AbleToMintFixture
      ));
    });
    it("Owner should be able to mint if they have enough funds and the funds were approved", async () => {
      await expect(await puzzleContract.mintEntry())
        .to.emit(puzzleContract, "Minted")
        .withArgs(ENTRY_LEVEL_NFT_ID, 1, owner.address);
    });
    it("Investor should be able to mint if they have enough funds and the funds were approved", async function () {
      await expect(await puzzleContract.connect(investor1).mintEntry())
        .to.emit(puzzleContract, "Minted")
        .withArgs(ENTRY_LEVEL_NFT_ID, 1, investor1.address);
    });
    it("Investor should have the Entry Level NFT after the mint", async () => {
      await puzzleContract.connect(investor1).mintEntry();
      const investor1HasEntryNFT = await puzzleContract
        .connect(investor1)
        .balanceOf(investor1.address, ENTRY_LEVEL_NFT_ID);
      expect(investor1HasEntryNFT).to.be.eq(1);
    });
    it("Investor should not be able to have more than 1 Entry NFT", async () => {
      await expect(await puzzleContract.connect(investor1).mintEntry()).to.not
        .be.reverted;
      await expect(
        puzzleContract.connect(investor1).mintEntry()
      ).to.be.revertedWith("User already has the Entry NFT");
    });
    it("Investors should not be able to mint more than the collection limit", async () => {
      const { paymentTokenContract, puzzleContract } = await loadFixture(
        deployContractFixture
      );
      const maxPerCollection = await puzzleContract.MAX_PER_COLLECTION();

      for (let i = 0; i < accounts.length; i++) {
        await paymentTokenContract
          .connect(accounts[i])
          .mint(PAYMENT_TOKEN_AMOUNT);
        await paymentTokenContract
          .connect(accounts[i])
          .approve(puzzleContract.address, PAYMENT_TOKEN_AMOUNT);
        if (i < accounts.length - 1) {
          await puzzleContract.connect(accounts[i]).mintEntry();
        }
      }

      await expect(
        puzzleContract.connect(accounts[accounts.length - 1]).mintEntry()
      ).to.be.revertedWith("Collection limit reached");
    });
  });
  describe("Pre-claim Puzzle NFT", async () => {
    beforeEach(async () => {
      const { puzzleContract } = await loadFixture(deployContractFixture);
    });
    it("Owner should not be allowed to claim() without the Entry NFT", async () => {
      await expect(puzzleContract.claim()).to.be.revertedWith(
        "User not able to claim"
      );
    });
    it("Investor should not be allowed to claim() without the Entry NFT", async () => {
      await expect(
        puzzleContract.connect(investor1).claim()
      ).to.be.revertedWith("User not able to claim");
    });
  });
  describe("Claim Puzzle NFT", async () => {
    beforeEach(async () => {
      //({ puzzleContract } = await loadFixture(investor1readyToClaimNFT));
    });
    it("Investor should be able to call verifyClaim (to claim an NFT Puzzle) after having invested the minimum amount required", async () => {
      const { puzzleContract } = await loadFixture(investor1readyToClaimNFT);

      expect(await puzzleContract.verifyClaim(investor1.address)).to.equal(
        true
      );
    });
    it("Investor should be able to call  claim (to claim a NFT Puzzle) after having invested the minimum amount required", async () => {
      const { puzzleContract } = await loadFixture(investor1readyToClaimNFT);

      await expect(await puzzleContract.connect(investor1).claim())
        .to.emit(puzzleContract, "Minted")
        .withArgs(anyValue, 1, investor1.address);
    });
  });
  describe("Pre-Burn LEVEL2 NFT", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(deployContractFixture));
    });
    it("Owner should not be able to burn without the required Puzzle NFTs", async () => {
      await expect(puzzleContract.burn()).to.be.revertedWith(
        "Not able to burn"
      );
    });
    it("Investor should not be able to burn without the required Puzzle NFTs", async () => {
      await expect(puzzleContract.connect(investor1).burn()).to.be.revertedWith(
        "Not able to burn"
      );
    });
  });
  describe("Burn LEVEL2 NFT", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(
        ownerAndInvestor1ReadyToBurnLevel2NFT
      ));
    });
    it("Owner should be able to burn LEVEL2 NFT", async () => {
      await expect(await puzzleContract.burn())
        .to.emit(puzzleContract, "BurnedBatch")
        .withArgs(owner.address, anyValue, anyValue);
      // await expect(await puzzleContract.burn())
      //   .to.emit(puzzleContract, "Minted")
      //   .withArgs(LEVEL2_NFT_ID, 1, owner.address);
    });
    it("Owner should be able to burn LEVEL2 NFT having 20 Puzzle NFTs and still have 10 left", async () => {
      // Mint 10 more Puzzle NFTs to the owner
      await puzzleContract.mintTest();
      // Fill the array with owner's address
      const accounts = new Array(10).fill(owner.address);
      // Shallow-clone sliced collections array
      const NFTIds = [...COLLECTIONS.slice(0, 10)];
      // Balance before Burn
      const puzzleNftBalanceBeforeBurn = await puzzleContract.balanceOfBatch(
        accounts,
        NFTIds
      );
      // Burn LEVEL2 NFT token
      await puzzleContract.burn();
      // Balance after Burn
      const puzzleNftBalanceAfterBurn = await puzzleContract.balanceOfBatch(
        accounts,
        NFTIds
      );
      const expectedArrayResults = puzzleNftBalanceAfterBurn.map(function (
        value: BigNumber,
        i: number
      ) {
        return value.add(1).eq(puzzleNftBalanceBeforeBurn[i]);
      });

      expect(expectedArrayResults.every((element) => element === true)).to.be
        .true;
    });
    it("Investor should be able to burn LEVEL2 NFT having 20 Puzzle NFTs and still have 10 left", async () => {
      // Mint 10 more Puzzle NFTs to the investor
      await puzzleContract.connect(investor1).mintTest();
      // Fill the array with investor's address
      const accounts = new Array(10).fill(investor1.address);
      // Shallow-clone sliced collections array
      const NFTIds = [...COLLECTIONS.slice(0, 10)];
      // Balance before Burn
      const puzzleNftBalanceBeforeBurn = await puzzleContract
        .connect(investor1)
        .balanceOfBatch(accounts, NFTIds);
      // Burn LEVEL2 NFT token
      await puzzleContract.connect(investor1).burn();
      // Balance after Burn
      const puzzleNftBalanceAfterBurn = await puzzleContract
        .connect(investor1)
        .balanceOfBatch(accounts, NFTIds);
      const expectedArrayResults = puzzleNftBalanceAfterBurn.map(function (
        value: BigNumber,
        i: number
      ) {
        return value.add(1).eq(puzzleNftBalanceBeforeBurn[i]);
      });

      expect(expectedArrayResults.every((element) => element === true)).to.be
        .true;
    });
    it("Investor should be able to burn LEVEL2 NFT", async () => {
      await expect(await puzzleContract.connect(investor1).burn())
        .to.emit(puzzleContract, "BurnedBatch")
        .withArgs(investor1.address, anyValue, anyValue);
    });
    it("Owner should not be able to burn more than 1 LEVEL2 NFT", async () => {
      await puzzleContract.burn();
      await expect(puzzleContract.burn()).to.be.revertedWith(
        "User already has the LEVEL2 NFT"
      );
    });
    it("Mint cannot surpass collection limit", async () => {});
  });
});
