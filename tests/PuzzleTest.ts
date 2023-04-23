import {
  CoinTest,
  CoinTest__factory,
  Factory,
  Factory__factory,
  Investment__factory,
  SLCore,
  SLCore__factory,
  SLLogics,
  SLLogics__factory,
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

// Constants
const COLLECTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
  PAYMENT_TOKEN_AMOUNT = 20000,
  ENTRY_LEVEL_NFT_ID = 1000, // 01000 batch - 0, cap - 1000
  LEVEL2_NFT_ID = 11,
  INVESTMENT1_AMOUNT = 100000,
  INVESTMENT_2_AMOUNT = 150000,
  INVESTMENT_LEVEL_2_AMOUNT = 200000,
  INVESTMENT_LEVEL_3_AMOUNT = 300000,
  INVESTOR1_INVESTMENT_AMOUNT = 6000,
  INVESTOR1_INVESTMENT_2_AMOUNT = 5000,
  INVESTOR1_INVESTMENT_LEVEL_2_AMOUNT = 10000,
  INVESTOR1_INVESTMENT_LEVEL_3_AMOUNT = 15000,
  PAYMENT_TOKEN_ID_0 = 0,
  PAYMENT_TOKEN_ID_1 = 1,
  ENTRY_BATCH_CAP = 1000,
  ENTRY_BATCH_PRICE = 100,
  ENTRY_TOKEN_URI = "TOKEN_URI";


function withDecimals(toConvert : number) {
  return toConvert * 10 ** 6;
}
describe("Puzzle Contract", async () => {
  // Variables
  let 
    puzzleContract: SLCore,
    logcisContract: SLLogics,
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
    const puzzleContractFactory = new SLCore__factory(owner);
    const logicsContractFactory = new SLLogics__factory(owner);
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
    //Deploy SLLogics contract
    logcisContract = await logicsContractFactory.deploy(
      factoryContract.address,
      paymentTokenContract.address
    );
    await logcisContract.deployed();
    // Deploy Puzzle contract from the factory passing Factory and PaymentToken deployed contract addresses
    puzzleContract = await puzzleContractFactory.deploy(
      factoryContract.address,
      logcisContract.address
    );
    await puzzleContract.deployed();
    // Set the Puzzle contract deployed as entry address on Factory contract
    await factoryContract.setEntryAddress(puzzleContract.address);
    // Allow SLCore to make changes in SLLogics
    await logcisContract.setAllowedContracts(puzzleContract.address, true);
    // Create a new entry batch
    await puzzleContract.generateNewEntryBatch(ENTRY_BATCH_CAP, ENTRY_BATCH_PRICE, ENTRY_TOKEN_URI);

    return {
      owner,
      investor1,
      investor2,
      investor3,
      paymentTokenContract,
      puzzleContract,
      factoryContract,
      logcisContract,
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
      logcisContract.address,
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
      logcisContract.address,
      withDecimals(PAYMENT_TOKEN_AMOUNT)
    );
    // Approve Puzzle contract to spend Investor1's PaymentTokens
    await paymentTokenContract
      .connect(investor1)
      .approve(logcisContract.address, withDecimals(PAYMENT_TOKEN_AMOUNT));
    return { paymentTokenContract, puzzleContract, logcisContract };
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
    const { paymentTokenContract, puzzleContract, logcisContract } = await loadFixture(
      deployContractFixture
    );
    await paymentTokenContract
      .connect(investor1)
      .approve(logcisContract.address, withDecimals(PAYMENT_TOKEN_AMOUNT));
    return { paymentTokenContract, puzzleContract, logcisContract };
  }

  async function investor1NotReeadyToClaimNFT() {
    const { paymentTokenContract, puzzleContract, factoryContract } =
      await loadFixture(deployContractFixture);

    // Mint PaymentTokens to investor
    await paymentTokenContract.connect(investor1).mint(PAYMENT_TOKEN_AMOUNT);
    // Mint PaymentTokens to owner
    await paymentTokenContract.mint(PAYMENT_TOKEN_AMOUNT);

    await paymentTokenContract
      .connect(investor1)
      .approve(logcisContract.address, withDecimals(PAYMENT_TOKEN_AMOUNT));

    puzzleContract.connect(investor1).mintEntry();

    await paymentTokenContract
      .approve(logcisContract.address, withDecimals(PAYMENT_TOKEN_AMOUNT));

    puzzleContract.mintEntry();

    const deployNewTx = await factoryContract.deployNew(
      INVESTMENT1_AMOUNT,
      paymentTokenContract.address,
      1
    );

    const deployedInvestmentAddress =
      await factoryContract.getLastDeployedContract(1);
    const investmentFactory = new Investment__factory(owner);
    const investmentContract = investmentFactory.attach(
      deployedInvestmentAddress
    );



    return { paymentTokenContract, puzzleContract, factoryContract };
  }

  async function investor1readyToClaimNFT() {
    const { paymentTokenContract, puzzleContract, factoryContract } =
      await loadFixture(deployContractFixture);

    // Mint PaymentTokens to investor
    await paymentTokenContract.connect(investor1).mint(PAYMENT_TOKEN_AMOUNT);

    await paymentTokenContract
      .connect(investor1)
      .approve(logcisContract.address, withDecimals(PAYMENT_TOKEN_AMOUNT));

    puzzleContract.connect(investor1).mintEntry();

    const deployNewTx = await factoryContract.deployNew(
      INVESTMENT1_AMOUNT,
      paymentTokenContract.address,
      1
    );

    const deployedInvestmentAddress =
      await factoryContract.getLastDeployedContract(1);
    const investmentFactory = new Investment__factory(owner);
    const investmentContract = investmentFactory.attach(
      deployedInvestmentAddress
    );

    // Allow investment contract to spend
    await paymentTokenContract
      .connect(investor1)
      .approve(investmentContract.address, withDecimals(INVESTOR1_INVESTMENT_AMOUNT));
    // Invest an amount on investment1
    await investmentContract
      .connect(investor1)
      .invest(INVESTOR1_INVESTMENT_AMOUNT);

    return { paymentTokenContract, puzzleContract, factoryContract };
  }
  async function ownerAndInvestor1ReadyToBurnLevel2NFT() {
    const { paymentTokenContract, puzzleContract, factoryContract } =
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
    // Mint Entry NFT for the owner
    await puzzleContract.mintEntry();
    // Mint Entry NFT for the Investor1
    await puzzleContract.connect(investor1).mintEntry();
    // Mint all Puzzle NFTs for the owner
    await puzzleContract.mintTest(1);
    // Mint all Puzzle NFTs for the investor1
    await puzzleContract.connect(investor1).mintTest(1);
    return { puzzleContract, factoryContract , paymentTokenContract};
  }

  async function investor1NotReadyToClaimLevel2Piece() {
    const { puzzleContract } = await loadFixture(ownerAndInvestor1ReadyToBurnLevel2NFT);
    //User in level 2
    await puzzleContract.connect(investor1).claimLevel();
    return { puzzleContract };
  }

  async function investor1ReadyToClaimLevel2Piece() {
    const { paymentTokenContract, factoryContract, puzzleContract } = await loadFixture(ownerAndInvestor1ReadyToBurnLevel2NFT);
    //User in level 2
    await puzzleContract.connect(investor1).claimLevel();
    await paymentTokenContract.connect(investor1).mint(INVESTOR1_INVESTMENT_LEVEL_2_AMOUNT);
    
    //generate level 2 investment contract
    const deployNewTx = await factoryContract.deployNew(
      INVESTMENT_LEVEL_2_AMOUNT,
      paymentTokenContract.address,
      2
    ); 
    const deployedInvestmentAddress = await factoryContract.getLastDeployedContract(2);
    const investmentFactory = new Investment__factory(owner);
    const investmentContract2 = investmentFactory.attach(deployedInvestmentAddress);
    // Allow investment contract to spend
    await paymentTokenContract.connect(investor1).approve(investmentContract2.address, withDecimals(INVESTOR1_INVESTMENT_LEVEL_2_AMOUNT));
    // Invest an amount on investment1
    await investmentContract2.connect(investor1).invest(INVESTOR1_INVESTMENT_LEVEL_2_AMOUNT);
    return { puzzleContract, paymentTokenContract, factoryContract };
  }

  async function investor1ReadyToClaimLevel3() {
    const { paymentTokenContract, factoryContract } = await loadFixture(investor1ReadyToClaimLevel2Piece);
    //User in level 3
    await puzzleContract.connect(investor1).mintTest(2);
    return { puzzleContract, paymentTokenContract, factoryContract };
    

  }

  async function investor1NotReadyToClaimLevel3Piece() {
    const { puzzleContract } = await loadFixture(investor1ReadyToClaimLevel3);
    //User in level 3
    await puzzleContract.connect(investor1).claimLevel();
    return { puzzleContract };
  }

  async function investor1ReadyToClaimLevel3Piece() {
    const { paymentTokenContract, factoryContract, puzzleContract } = await loadFixture(investor1ReadyToClaimLevel3);
    //User in level 3
    await puzzleContract.connect(investor1).claimLevel();
    
    await paymentTokenContract.connect(investor1).mint(INVESTOR1_INVESTMENT_LEVEL_3_AMOUNT);
    
    
    //generate level 3 investment contract
    const deployNewTx = await factoryContract.deployNew(
      INVESTMENT_LEVEL_2_AMOUNT,
      paymentTokenContract.address,
      3
    ); 

    await deployNewTx.wait();
    const deployedInvestmentAddress = await factoryContract.getLastDeployedContract(3);
    
    const investmentFactory = new Investment__factory(owner);
    const investmentContract2 = investmentFactory.attach(deployedInvestmentAddress);
    // Allow investment contract to spend
    await paymentTokenContract.connect(investor1).approve(investmentContract2.address, withDecimals(INVESTOR1_INVESTMENT_LEVEL_3_AMOUNT));
    // Invest an amount on investment1
    await investmentContract2.connect(investor1).invest(INVESTOR1_INVESTMENT_LEVEL_3_AMOUNT);
    return { puzzleContract, paymentTokenContract, factoryContract };
  }
  

  describe("When the contract is deployed", async function () {
    
    it("Should set the factory address", async () => {
      const { factoryContract, puzzleContract } = await loadFixture(
        deployContractFixture
      );
      // Get Factory address from the Puzzle contract
      const factoryAddressFromContract = await puzzleContract.factoryAddress();
      expect(factoryAddressFromContract).to.be.equal(factoryContract.address);
    });
    it("Should set the SLLogic address", async () => {
      const { logcisContract, puzzleContract } = await loadFixture(
        deployContractFixture
      );
      // Get the PaymentToken address from the Puzzle contract
      const slLogicAddressFromContract =
        await puzzleContract.slLogicsAddress();
      expect(slLogicAddressFromContract).to.be.equal(
        logcisContract.address
      );
    });
    describe("Metadata", async () => {
      beforeEach(async () => {
        ({ puzzleContract } = await loadFixture(deployContractFixture));
      });
      it("Get the right metadata for every collection but levels 1", async () => {
        expect(await puzzleContract.uri(1)).to.equal(
          `INSERT_HERE/1.json`
        );
      });
      it("Should get the right metadata for level 1s", async () => {
        expect(await puzzleContract.uri(1000)).to.equal(
          `${ENTRY_TOKEN_URI}`
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
        ownerPaymentTokenBalanceBefore.add(withDecimals(PAYMENT_TOKEN_AMOUNT))
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
        .to.emit(puzzleContract, "TokensClaimed")
        .withArgs(owner.address, ENTRY_LEVEL_NFT_ID, 1);
    });
    it("Investor should be able to mint if they have enough funds and the funds were approved", async function () {
      await expect(await puzzleContract.connect(investor1).mintEntry())
        .to.emit(puzzleContract, "TokensClaimed")
        .withArgs(investor1.address ,ENTRY_LEVEL_NFT_ID, 1);
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
      ).to.be.revertedWith("SLCore: User have an entry token");
    });
    it("Investors should not be able to mint more than the collection limit", async () => {
      const { paymentTokenContract, puzzleContract } = await loadFixture(
        deployContractFixture
      );

      await puzzleContract.generateNewEntryBatch(15, ENTRY_BATCH_PRICE, ENTRY_TOKEN_URI); //15 due to having 16 accounts on hardhat
      const maxOnFirstEntryBatch = ENTRY_BATCH_CAP;

      for (let i = 0; i < accounts.length; i++) {
        await paymentTokenContract
          .connect(accounts[i])
          .mint(PAYMENT_TOKEN_AMOUNT);
        await paymentTokenContract
          .connect(accounts[i])
          .approve(logcisContract.address, withDecimals(PAYMENT_TOKEN_AMOUNT));
        if (i < accounts.length - 1) {
          await puzzleContract.connect(accounts[i]).mintEntry();
        }
      }

      await expect(
        puzzleContract.connect(accounts[accounts.length - 1]).mintEntry()
      ).to.be.revertedWith("SLLevels: No entry tokens available");
    });
  });
  describe("Pre-claim Puzzle NFT", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(deployContractFixture));
    });
    it("Owner should not be allowed to claim() without the Entry NFT", async () => {
      await expect(puzzleContract.claimPiece()).to.be.revertedWith(
        "SLLevels: User doesnt have the level"
      );
    });
    it("Investor should not be allowed to claim() without the Entry NFT", async () => {
      await expect(
        puzzleContract.connect(investor1).claimPiece()
      ).to.be.revertedWith("SLLevels: User doesnt have the level");
    });
  });
  describe("Claim Puzzle NFT", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(investor1readyToClaimNFT));
    });
    it("Investor should be able to call verifyClaim (to claim an NFT Puzzle) after having invested the minimum amount required", async () => {
      expect(
        await puzzleContract.connect(investor1).verifyClaim(investor1.address, 1)
      ).not.to.be.reverted;
    });
    it("Investor should be able to call  claim (to claim a NFT Puzzle) after having invested the minimum amount required", async () => {
      await expect(await puzzleContract.connect(investor1).claimPiece())
        .to.emit(puzzleContract, "TokensClaimed")
        .withArgs(investor1.address, anyValue, 1);
    });
  });
  describe("Pre-claim LEVEL2 NFT", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(investor1NotReeadyToClaimNFT));
    });
    it("Owner should not be able to burn without the required Puzzle NFTs", async () => {
      await expect(puzzleContract.claimLevel()).to.be.revertedWith(
        "SLLevels: User must have all Level1 pieces"
      );
    });
    it("Investor should not be able to burn without the required Puzzle NFTs", async () => {
      await expect(puzzleContract.connect(investor1).claimLevel()).to.be.revertedWith(
        "SLLevels: User must have all Level1 pieces"
      );
    });
  });
  describe("Claim LEVEL2 NFT", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(
        ownerAndInvestor1ReadyToBurnLevel2NFT
      ));
    });
    it("Owner should be able to burn LEVEL2 NFT", async () => {
      await expect(await puzzleContract.claimLevel())
        .to.emit(puzzleContract, "TokensClaimed")
        .withArgs(owner.address, 30, 1);
      // await expect(await puzzleContract.burn())
      //   .to.emit(puzzleContract, "Minted")
      //   .withArgs(LEVEL2_NFT_ID, 1, owner.address);
    });
    it("Owner should be able to claim LEVEL2 NFT having 20 Puzzle NFTs and still have 10 left", async () => {
      // Mint 10 more Puzzle NFTs to the owner
      await puzzleContract.mintTest(1);
      // Fill the array with owner's address
      const accounts = new Array(10).fill(owner.address);
      // Shallow-clone sliced collections array
      const NFTIds = [...COLLECTIONS.slice(0, 10)];
      // Balance before Burn
      const puzzleNftBalanceBeforeBurn = await puzzleContract.balanceOfBatch(
        accounts,
        NFTIds
      );
      // Claim Level
      await puzzleContract.claimLevel();
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
    it("Investor should be able to claim LEVEL2 NFT having 20 Puzzle NFTs and still have 10 left", async () => {
      // Mint 10 more Puzzle NFTs to the investor
      await puzzleContract.connect(investor1).mintTest(1);
      // Fill the array with investor's address
      const accounts = new Array(10).fill(investor1.address);
      // Shallow-clone sliced collections array
      const NFTIds = [...COLLECTIONS.slice(0, 10)];
      // Balance before Burn
      const puzzleNftBalanceBeforeBurn = await puzzleContract
        .connect(investor1)
        .balanceOfBatch(accounts, NFTIds);
      // Burn LEVEL2 NFT token
      await puzzleContract.connect(investor1).claimLevel();
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
    it("Investor should be able to claim LEVEL2 NFT", async () => {
      await expect(await puzzleContract.connect(investor1).claimLevel())
        .to.emit(puzzleContract, "TokensClaimed")
        .withArgs(investor1.address, 30, 1);
    });
    it("Owner should when minting level again should be asked for Level2 Puzzle Pieces", async () => {
      await puzzleContract.claimLevel();
      await expect(puzzleContract.claimLevel()).to.be.revertedWith(
        "SLLevels: User must have all Level2 pieces"
      );
    });
  });
  describe("Pre-claim Puzzle NFT Level 2", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(investor1NotReadyToClaimLevel2Piece));
    });
    it("should not be allowed to call if the user has not invested enough on level 2 contracts", async () => {
      await expect(puzzleContract.claimPiece()).to.be.revertedWith(
        "SLLogics: User does not have enough investment to claim this piece"
      );
    });
  });
  describe("Claiming Puzzle NFT Level 2", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(investor1ReadyToClaimLevel2Piece));
    });
    it("should be able to claim after investing 10k on level2 contracts", async () => {
      await expect(puzzleContract.connect(investor1).claimPiece()).to.emit(puzzleContract, "TokensClaimed")
      .withArgs(investor1.address, anyValue, 1);
    });
    it("Investor should be able to call verifyClaim (to claim an NFT Puzzle) after having invested the minimum amount required", async () => {
      expect(
        await puzzleContract.connect(investor1).verifyClaim(investor1.address, 2)
      ).not.to.be.reverted;
    });
    it("user should not be able to reclaim while he hasnt invested enough", async () => {
      await expect(puzzleContract.connect(investor1).claimPiece()).to.emit(puzzleContract, "TokensClaimed")
      .withArgs(investor1.address, anyValue, 1);
      await expect(puzzleContract.connect(investor1).claimPiece()).to.be.revertedWith("SLLogics: User does not have enough investment to claim this piece");
    });
  });
  describe("Pre-claim LEVEL3 NFT", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(investor1NotReadyToClaimLevel2Piece));
    });
    it("Investor should not be able to burn without the required Puzzle NFTs", async () => {
      await expect(puzzleContract.connect(investor1).claimLevel()).to.be.revertedWith(
        "SLLevels: User must have all Level2 pieces"
      );
    });
  });
  describe("Claim LEVEL3 NFT", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(investor1ReadyToClaimLevel3));
    });
    it("Investor should be able to claim LEVEL2 NFT", async () => {
      await expect(await puzzleContract.connect(investor1).claimLevel())
        .to.emit(puzzleContract, "TokensClaimed")
        .withArgs(investor1.address, 31, 1);
    });
    it("Investor should have level 3 NFT on his wallet", async () => {
      await puzzleContract.connect(investor1).claimLevel()
      await expect(await puzzleContract.balanceOf(investor1.address, 31)).to.be.eq(
        1
      );
    });
    it("Investor should be able to claim LEVEL3 NFT having 20 Puzzle NFTs and still have 10 left", async () => {
      // Mint 10 more Puzzle NFTs to the investor
      await puzzleContract.connect(investor1).mintTest(2);
      // Fill the array with investor's address
      const accounts = new Array(10).fill(investor1.address);
      // Shallow-clone sliced collections array
      const NFTIds = [...COLLECTIONS.slice(10, 20)];
      // Balance before Burn
      const puzzleNftBalanceBeforeBurn = await puzzleContract
        .connect(investor1)
        .balanceOfBatch(accounts, NFTIds);
      // Burn LEVEL2 NFT token
      await puzzleContract.connect(investor1).claimLevel();
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
    it("Investor should not be able to claim level 3 again", async () => {
      await puzzleContract.connect(investor1).claimLevel()
      await expect(await puzzleContract.balanceOf(investor1.address, 31)).to.be.eq(
        1
      );
      
      await expect(puzzleContract.connect(investor1).claimLevel()).to.be.revertedWith("SLCore: User at Top Level");
    });
  });
  describe("Pre-claim Puzzle NFT Level 3", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(investor1NotReadyToClaimLevel3Piece));
    });
    it("should not be allowed to call if the user has not invested enough on level 3 contracts", async () => {
      await expect(puzzleContract.claimPiece()).to.be.revertedWith(
        "SLLogics: User does not have enough investment to claim this piece"
      );
    });
  });
  describe("Claiming Puzzle NFT Level 3", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(investor1ReadyToClaimLevel3Piece));
    });
    it("should be able to claim after investing 15k on level3 contracts", async () => {
      await expect(puzzleContract.connect(investor1).claimPiece()).to.emit(puzzleContract, "TokensClaimed")
      .withArgs(investor1.address, anyValue, 1);
    });
    it("Investor should be able to call verifyClaim (to claim an NFT Puzzle) after having invested the minimum amount required", async () => {
      expect(
        await puzzleContract.connect(investor1).verifyClaim(investor1.address, 3)
      ).not.to.be.reverted;
    });
    it("user should not be able to reclaim while he hasnt invested enough", async () => {
      await expect(puzzleContract.connect(investor1).claimPiece()).to.emit(puzzleContract, "TokensClaimed")
      .withArgs(investor1.address, anyValue, 1);
      await expect(puzzleContract.connect(investor1).claimPiece()).to.be.revertedWith("SLLogics: User does not have enough investment to claim this piece");
    });
  });

  describe("Puzzle && Factory", async () => {
    beforeEach(async () => {
      ({ factoryContract } = await loadFixture(investor1readyToClaimNFT));
    });
    it("Should get Investor's balance from Factory", async () => {
      // Create new investment
      await factoryContract.deployNew(
        INVESTMENT_2_AMOUNT,
        paymentTokenContract.address,
        1
      );

      const deployedInvestmentAddress =
        await factoryContract.getLastDeployedContract(1);
      const investmentFactory = new Investment__factory(owner);
      const investmentContract = investmentFactory.attach(
        deployedInvestmentAddress
      );
      await paymentTokenContract
        .connect(investor1)
        .approve(investmentContract.address, withDecimals(INVESTOR1_INVESTMENT_2_AMOUNT));
      await investmentContract
        .connect(investor1)
        .invest(INVESTOR1_INVESTMENT_2_AMOUNT);
      const userBalanceOnContracts = await factoryContract.getAddressTotal(
        investor1.address
      );
      expect(userBalanceOnContracts).to.be.equal(
        withDecimals(INVESTOR1_INVESTMENT_AMOUNT + INVESTOR1_INVESTMENT_2_AMOUNT)
      );
    });
  });
});
