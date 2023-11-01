import {
  AttackSLCoreEntry__factory,
  AttackSLCoreClaimPiece__factory,
  AttackSLCoreClaimLevel__factory,
  CoinTest,
  CoinTest__factory,
  Factory,
  Factory__factory,
  Investment__factory,
  SLCore,
  SLCoreTest,
  SLCoreTest__factory,
  SLCore__factory,
  SLLogics,
  SLLogics__factory,
  SLPermissions,
  SLPermissions__factory,
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { log } from "console";
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

// Constants
const COLLECTIONS = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  ],
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

function withDecimals(toConvert: number) {
  return toConvert * 10 ** 6;
}
describe("Puzzle Contract", async () => {
  // Variables
  let puzzleContract: SLCoreTest,
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
    investor3: SignerWithAddress,
    ownerBalanceBefore: BigNumber,
    baseUriFromContract: string;

  async function deployContractFixtureWithoutBatch() {
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
    const puzzleContractFactory = new SLCoreTest__factory(owner);
    const logicsContractFactory = new SLLogics__factory(owner);
    const factoryContractFactory = new Factory__factory(owner);
    const coreContractFactory = new SLCore__factory(owner);

    // Deploy PaymentToken (CoinTest) contract from the factory
    paymentTokenContract = await paymentTokenContractFactory.deploy();
    await paymentTokenContract.deployed();

    // Deploy PaymentToken (CoinTest) contract from the factory
    paymentTokenContract2 = await paymentTokenContractFactory.deploy();
    await paymentTokenContract2.deployed();

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
    logcisContract = await logicsContractFactory.deploy(
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
      .setAllowedContracts(puzzleContract.address, 1);

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
      coreContractFactory,
      permissionsContract,
    };
  }

  async function deployContractFixture() {
    const {
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
    } = await deployContractFixtureWithoutBatch();
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
    const {
      paymentTokenContract,
      puzzleContract,
      factoryContract,
      logcisContract,
      ceo,
    } = await loadFixture(deployContractFixture);
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
      factoryContract,
      ceo,
    };
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
    const { paymentTokenContract, puzzleContract, logcisContract } =
      await loadFixture(deployContractFixture);
    await paymentTokenContract
      .connect(investor1)
      .approve(logcisContract.address, withDecimals(PAYMENT_TOKEN_AMOUNT));
    return { paymentTokenContract, puzzleContract, logcisContract };
  }

  async function investor1NotReeadyToClaimNFT() {
    const {
      paymentTokenContract,
      puzzleContract,
      factoryContract,
      logcisContract,
    } = await loadFixture(deployContractFixture);

    // Mint PaymentTokens to investor
    await paymentTokenContract.connect(investor1).mint(PAYMENT_TOKEN_AMOUNT);
    // Mint PaymentTokens to owner
    await paymentTokenContract.mint(PAYMENT_TOKEN_AMOUNT);

    await paymentTokenContract
      .connect(investor1)
      .approve(logcisContract.address, withDecimals(PAYMENT_TOKEN_AMOUNT));

    puzzleContract.connect(investor1).mintEntry();

    await paymentTokenContract.approve(
      logcisContract.address,
      withDecimals(PAYMENT_TOKEN_AMOUNT)
    );

    puzzleContract.mintEntry();

    const deployNewTx = await factoryContract
      .connect(ceo)
      .deployNew(
        INVESTMENT1_AMOUNT,
        paymentTokenContract.address,
        paymentTokenContract2.address,
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
    const {
      paymentTokenContract,
      puzzleContract,
      factoryContract,
      logcisContract,
      ceo,
    } = await loadFixture(deployContractFixture);

    // Mint PaymentTokens to investor
    await paymentTokenContract.connect(investor1).mint(PAYMENT_TOKEN_AMOUNT);

    await paymentTokenContract
      .connect(investor1)
      .approve(logcisContract.address, withDecimals(PAYMENT_TOKEN_AMOUNT));

    puzzleContract.connect(investor1).mintEntry();

    const deployNewTx = await factoryContract
      .connect(ceo)
      .deployNew(
        INVESTMENT1_AMOUNT,
        paymentTokenContract.address,
        paymentTokenContract2.address,
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
      .approve(
        investmentContract.address,
        withDecimals(INVESTOR1_INVESTMENT_AMOUNT)
      );
    // Invest an amount on investment1
    await investmentContract
      .connect(investor1)
      .invest(INVESTOR1_INVESTMENT_AMOUNT, 0);

    return { paymentTokenContract, puzzleContract, factoryContract, ceo };
  }
  async function ownerAndInvestor1ReadyToBurnLevel2NFT() {
    const {
      paymentTokenContract,
      puzzleContract,
      factoryContract,
      logcisContract,
      ceo,
    } = await loadFixture(deployContractFixture);
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
    return { puzzleContract, factoryContract, paymentTokenContract, ceo };
  }

  async function investor1NotReadyToClaimLevel2Piece() {
    const { puzzleContract } = await loadFixture(
      ownerAndInvestor1ReadyToBurnLevel2NFT
    );
    //User in level 2
    await puzzleContract.connect(investor1).claimLevel();
    return { puzzleContract };
  }

  async function investor1ReadyToClaimLevel2Piece() {
    const { paymentTokenContract, factoryContract, puzzleContract, ceo } =
      await loadFixture(ownerAndInvestor1ReadyToBurnLevel2NFT);
    //User in level 2
    await puzzleContract.connect(investor1).claimLevel();
    await paymentTokenContract
      .connect(investor1)
      .mint(INVESTOR1_INVESTMENT_LEVEL_2_AMOUNT);

    //generate level 2 investment contract
    const deployNewTx = await factoryContract
      .connect(ceo)
      .deployNew(
        INVESTMENT_LEVEL_2_AMOUNT,
        paymentTokenContract.address,
        paymentTokenContract2.address,
        2
      );
    const deployedInvestmentAddress =
      await factoryContract.getLastDeployedContract(2);
    const investmentFactory = new Investment__factory(owner);
    const investmentContract2 = investmentFactory.attach(
      deployedInvestmentAddress
    );
    // Allow investment contract to spend
    await paymentTokenContract
      .connect(investor1)
      .approve(
        investmentContract2.address,
        withDecimals(INVESTOR1_INVESTMENT_LEVEL_2_AMOUNT)
      );
    // Invest an amount on investment1
    await investmentContract2
      .connect(investor1)
      .invest(INVESTOR1_INVESTMENT_LEVEL_2_AMOUNT, 0);
    return { puzzleContract, paymentTokenContract, factoryContract, ceo };
  }

  async function investor1ReadyToClaimLevel3() {
    const { paymentTokenContract, factoryContract, ceo } = await loadFixture(
      investor1ReadyToClaimLevel2Piece
    );
    //User in level 3
    await puzzleContract.connect(investor1).mintTest(2);
    return { puzzleContract, paymentTokenContract, factoryContract, ceo };
  }

  async function investor1NotReadyToClaimLevel3Piece() {
    const { puzzleContract } = await loadFixture(investor1ReadyToClaimLevel3);
    //User in level 3
    await puzzleContract.connect(investor1).claimLevel();
    return { puzzleContract };
  }

  async function investor1ReadyToClaimLevel3Piece() {
    const { paymentTokenContract, factoryContract, puzzleContract, ceo } =
      await loadFixture(ownerAndInvestor1AbleToMintFixture);
    await puzzleContract.connect(investor1).mintEntry();
    await puzzleContract.connect(investor1).mintTest(1);
    await puzzleContract.connect(investor1).mintTest(2);
    await puzzleContract.connect(investor1).claimLevel();
    await puzzleContract.connect(investor1).claimLevel();

    await paymentTokenContract
      .connect(investor1)
      .mint(INVESTOR1_INVESTMENT_LEVEL_3_AMOUNT);

    //generate level 3 investment contract
    const deployNewTx = await factoryContract
      .connect(ceo)
      .deployNew(
        INVESTMENT_LEVEL_3_AMOUNT,
        paymentTokenContract.address,
        paymentTokenContract2.address,
        3
      );

    await deployNewTx.wait();
    const deployedInvestmentAddress =
      await factoryContract.getLastDeployedContract(3);

    const investmentFactory = new Investment__factory(owner);
    const investmentContract2 = investmentFactory.attach(
      deployedInvestmentAddress
    );
    // Allow investment contract to spend
    await paymentTokenContract
      .connect(investor1)
      .approve(
        investmentContract2.address,
        withDecimals(INVESTOR1_INVESTMENT_LEVEL_3_AMOUNT)
      );
    // Invest an amount on investment1
    await investmentContract2
      .connect(investor1)
      .invest(INVESTOR1_INVESTMENT_LEVEL_3_AMOUNT, 0);
    return { puzzleContract, paymentTokenContract, factoryContract, ceo };
  }

  describe("When the contract is deployed", async function () {
    it("Should set the permissions address", async () => {
      const { factoryContract, puzzleContract } = await loadFixture(
        deployContractFixture
      );
      // Get Factory address from the Puzzle contract
      const factoryAddressFromContract =
        await puzzleContract.slPermissionsAddress();
      expect(factoryAddressFromContract).to.be.equal(
        permissionsContract.address
      );
    });
    it("Should set the SLLogic address", async () => {
      const { logcisContract, puzzleContract } = await loadFixture(
        deployContractFixture
      );
      // Get the PaymentToken address from the Puzzle contract
      const slLogicAddressFromContract = await puzzleContract.slLogicsAddress();
      expect(slLogicAddressFromContract).to.be.equal(logcisContract.address);
    });

    it("_slLogicsAddress cannot be passed as AddressZero", async () => {
      const { coreContractFactory, permissionsContract, puzzleContract } =
        await loadFixture(deployContractFixtureWithoutBatch);
      // Get the PaymentToken address from the Puzzle contract
      await expect(
        coreContractFactory.deploy(
          ethers.constants.AddressZero,
          permissionsContract.address
        )
      ).to.be.revertedWithCustomError(puzzleContract, "InvalidAddress");
    });
    it("_slPermissionsAddress cannot be passed as AddressZero", async () => {
      const { coreContractFactory, logcisContract, puzzleContract } =
        await loadFixture(deployContractFixtureWithoutBatch);
      // Get the PaymentToken address from the Puzzle contract
      await expect(
        coreContractFactory.deploy(
          logcisContract.address,
          ethers.constants.AddressZero
        )
      ).to.be.revertedWithCustomError(puzzleContract, "InvalidAddress");
    });

    describe("Metadata", async () => {
      beforeEach(async () => {
        ({ puzzleContract } = await loadFixture(deployContractFixture));
      });
      it("Get the right metadata for every collection but levels 1", async () => {
        expect(await puzzleContract.uri(1)).to.equal(`INSERT_HERE/1.json`);
      });
      it("Should get the right metadata for level 1s", async () => {
        expect(await puzzleContract.uri(1000)).to.equal(`${ENTRY_TOKEN_URI}`);
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
    it("Investor ready to mint shouldnt be able if there are no entry batches", async () => {
      const { puzzleContract } = await loadFixture(
        deployContractFixtureWithoutBatch
      );

      await expect(
        puzzleContract.connect(investor1).mintEntry()
      ).to.be.revertedWithCustomError(puzzleContract, "InexistentEntryBatch");
    });
  });
  describe("Minting the entry NFT", async () => {
    it("Investors should not be able to mint more than the collection limit", async () => {
      const { paymentTokenContract, puzzleContract, logcisContract, ceo } =
        await loadFixture(deployContractFixture);

      await puzzleContract
        .connect(ceo)
        .generateNewEntryBatch(15, ENTRY_BATCH_PRICE, ENTRY_TOKEN_URI); //15 due to having 16 accounts on hardhat
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
      ).to.be.revertedWithCustomError(puzzleContract, "NoTokensRemaining");
    });
    it("Owner should be able to mint if they have enough funds and the funds were approved", async () => {
      const { puzzleContract } = await loadFixture(
        ownerAndInvestor1AbleToMintFixture
      );
      await expect(await puzzleContract.mintEntry())
        .to.emit(puzzleContract, "TokensClaimed")
        .withArgs(owner.address, ENTRY_LEVEL_NFT_ID);
    });
    it("Investor should be able to mint if they have enough funds and the funds were approved", async function () {
      const { puzzleContract } = await loadFixture(
        ownerAndInvestor1AbleToMintFixture
      );
      await expect(await puzzleContract.connect(investor1).mintEntry())
        .to.emit(puzzleContract, "TokensClaimed")
        .withArgs(investor1.address, ENTRY_LEVEL_NFT_ID);
    });
    it("Investor should have the Entry Level NFT after the mint", async () => {
      const { puzzleContract } = await loadFixture(
        ownerAndInvestor1AbleToMintFixture
      );
      await puzzleContract.connect(investor1).mintEntry();
      const investor1HasEntryNFT = await puzzleContract
        .connect(investor1)
        .balanceOf(investor1.address, ENTRY_LEVEL_NFT_ID);
      expect(investor1HasEntryNFT).to.be.eq(1);
    });
    it("Investor should not be able to have more than 1 Entry NFT", async () => {
      const { puzzleContract } = await loadFixture(
        ownerAndInvestor1AbleToMintFixture
      );
      await puzzleContract.connect(investor1).mintEntry();
      await expect(
        puzzleContract.connect(investor1).mintEntry()
      ).to.be.revertedWithCustomError(puzzleContract, "IncorrectUserLevel");
    });
  });
  describe("Pre-claim Puzzle NFT", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(deployContractFixture));
    });
    it("Owner should not be allowed to claim() without the Entry NFT", async () => {
      await expect(puzzleContract.claimPiece()).to.be.revertedWithCustomError(
        puzzleContract,
        "IncorrectUserLevel"
      );
    });
    it("Investor should not be allowed to claim() without the Entry NFT", async () => {
      await expect(
        puzzleContract.connect(investor1).claimPiece()
      ).to.be.revertedWithCustomError(puzzleContract, "IncorrectUserLevel");
    });
  });
  describe("Claim Puzzle NFT", async () => {
    it("Investor should be able to call verifyClaim (to claim an NFT Puzzle) after having invested the minimum amount required", async () => {
      const { puzzleContract } = await loadFixture(investor1readyToClaimNFT);
      expect(
        await puzzleContract
          .connect(investor1)
          .verifyClaim(investor1.address, 1)
      ).not.to.be.reverted;
    });
    it("Investor should be able to call  claim (to claim a NFT Puzzle) after having invested the minimum amount required", async () => {
      const { puzzleContract } = await loadFixture(investor1readyToClaimNFT);
      await expect(await puzzleContract.connect(investor1).claimPiece())
        .to.emit(puzzleContract, "TokensClaimed")
        .withArgs(investor1.address, anyValue);
    });
    it("user should be able to claim a piece", async () => {
      const { puzzleContract } = await loadFixture(investor1readyToClaimNFT);
      await expect(puzzleContract.connect(investor1).claimPiece())
        .to.emit(puzzleContract, "TokensClaimed")
        .withArgs(investor1.address, anyValue);
    });
    it("user should not be able to reclaim while he hasnt invested enough", async () => {
      const { puzzleContract } = await loadFixture(investor1readyToClaimNFT);
      puzzleContract.connect(investor1).claimPiece();
      await expect(
        puzzleContract.connect(investor1).claimPiece()
      ).to.be.revertedWithCustomError(
        logcisContract,
        "MissingInvestmentToClaim"
      );
    });
  });
  describe("Pre-claim LEVEL2 NFT", async () => {
    it("Owner should not be able to burn without the required Puzzle NFTs", async () => {
      const { puzzleContract } = await loadFixture(
        investor1NotReeadyToClaimNFT
      );
      await expect(puzzleContract.claimLevel()).to.be.revertedWithCustomError(
        puzzleContract,
        "UserMustHaveCompletePuzzle"
      );
    });
    it("Investor should not be able to burn without the required Puzzle NFTs", async () => {
      const { puzzleContract } = await loadFixture(
        investor1NotReeadyToClaimNFT
      );
      await expect(
        puzzleContract.connect(investor1).claimLevel()
      ).to.be.revertedWithCustomError(
        puzzleContract,
        "UserMustHaveCompletePuzzle"
      );
    });
  });
  describe("Claim LEVEL2 NFT", async () => {
    it("Owner should be able to burn LEVEL2 NFT", async () => {
      const { puzzleContract } = await loadFixture(
        ownerAndInvestor1ReadyToBurnLevel2NFT
      );
      await expect(await puzzleContract.claimLevel())
        .to.emit(puzzleContract, "TokensClaimed")
        .withArgs(owner.address, 30);
    });
    it("Owner should be able to claim LEVEL2 NFT having 20 Puzzle NFTs and still have 10 left", async () => {
      const { puzzleContract } = await loadFixture(
        ownerAndInvestor1ReadyToBurnLevel2NFT
      );
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
      const { puzzleContract } = await loadFixture(
        ownerAndInvestor1ReadyToBurnLevel2NFT
      );
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
      const { puzzleContract } = await loadFixture(
        ownerAndInvestor1ReadyToBurnLevel2NFT
      );
      await expect(await puzzleContract.connect(investor1).claimLevel())
        .to.emit(puzzleContract, "TokensClaimed")
        .withArgs(investor1.address, 30);
    });
    it("Investor should not be able to call verifyClaim for LEVEL2 after owning the LEVEL2 token", async () => {
      const { puzzleContract } = await loadFixture(
        ownerAndInvestor1ReadyToBurnLevel2NFT
      );
      await puzzleContract.connect(investor1).claimLevel();
      await expect(
        puzzleContract._userAllowedToBurnPuzzle(investor1.address, 30)
      ).to.revertedWithCustomError(puzzleContract, "IncorrectUserLevel");
    });
    it("Owner should when minting level again should be asked for Level2 Puzzle Pieces", async () => {
      const { puzzleContract } = await loadFixture(
        ownerAndInvestor1ReadyToBurnLevel2NFT
      );
      await puzzleContract.claimLevel();
      await expect(puzzleContract.claimLevel()).to.be.revertedWithCustomError(
        puzzleContract,
        "UserMustHaveCompletePuzzle"
      );
    });
  });
  describe("Pre-claim Puzzle NFT Level 2", async () => {
    it("should not be allowed to call if the user has not invested enough on level 2 contracts", async () => {
      const { puzzleContract } = await loadFixture(
        investor1NotReadyToClaimLevel2Piece
      );
      await expect(puzzleContract.claimPiece()).to.be.revertedWithCustomError(
        logcisContract,
        "MissingInvestmentToClaim"
      );
    });
  });
  describe("Claiming Puzzle NFT Level 2", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(
        investor1ReadyToClaimLevel2Piece
      ));
    });
    it("should be able to claim after investing 10k on level2 contracts", async () => {
      await expect(puzzleContract.connect(investor1).claimPiece())
        .to.emit(puzzleContract, "TokensClaimed")
        .withArgs(investor1.address, anyValue);
    });
    it("Investor should be able to call verifyClaim (to claim an NFT Puzzle) after having invested the minimum amount required", async () => {
      expect(
        await puzzleContract
          .connect(investor1)
          .verifyClaim(investor1.address, 2)
      ).not.to.be.reverted;
    });
    it("user should should be able to claim if passing the criteria", async () => {
      await expect(puzzleContract.connect(investor1).claimPiece())
        .to.emit(puzzleContract, "TokensClaimed")
        .withArgs(investor1.address, anyValue);
    });
    it("user should not be able to reclaim while he hasnt invested enough", async () => {
      puzzleContract.connect(investor1).claimPiece();
      await expect(
        puzzleContract.connect(investor1).claimPiece()
      ).to.be.revertedWithCustomError(
        logcisContract,
        "MissingInvestmentToClaim"
      );
    });
  });
  describe("Pre-claim LEVEL3 NFT", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(
        investor1NotReadyToClaimLevel2Piece
      ));
    });
    it("Investor should not be able to burn without the required Puzzle NFTs", async () => {
      await expect(
        puzzleContract.connect(investor1).claimLevel()
      ).to.be.revertedWithCustomError(
        puzzleContract,
        "UserMustHaveCompletePuzzle"
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
        .withArgs(investor1.address, 31);
    });
    it("Investor should have level 3 NFT on his wallet", async () => {
      await puzzleContract.connect(investor1).claimLevel();
      await expect(
        await puzzleContract.balanceOf(investor1.address, 31)
      ).to.be.eq(1);
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
    it("Investor should not be able to call verifyClaim for LEVEL3 after owning the LEVEL3 token", async () => {
      await puzzleContract.connect(investor1).claimLevel();
      await expect(
        puzzleContract._userAllowedToBurnPuzzle(investor1.address, 31)
      ).to.revertedWithCustomError(puzzleContract, "IncorrectUserLevel");
    });
    it("Investor should not be able to claim level 3 again", async () => {
      await puzzleContract.connect(investor1).claimLevel();
      await puzzleContract.balanceOf(investor1.address, 31);

      await expect(
        puzzleContract.connect(investor1).claimLevel()
      ).to.be.revertedWithCustomError(puzzleContract, "IncorrectUserLevel");
    });
  });
  describe("Pre-claim Puzzle NFT Level 3", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(investor1ReadyToClaimLevel3));
    });
    it("should not be allowed to call if the user has not invested enough on level 3 contracts", async () => {
      puzzleContract.connect(investor1).claimLevel();
      await expect(puzzleContract.claimPiece()).to.be.revertedWithCustomError(
        logcisContract,
        "MissingInvestmentToClaim"
      );
    });
  });
  describe("Claiming Puzzle NFT Level 3", async () => {
    it("should be able to claim after investing 15k on level3 contracts", async () => {
      const { puzzleContract } = await loadFixture(
        investor1ReadyToClaimLevel3Piece
      );

      await expect(puzzleContract.connect(investor1).claimPiece())
        .to.emit(puzzleContract, "TokensClaimed")
        .withArgs(investor1.address, anyValue);
    });
    it("Investor should be able to call verifyClaim (to claim an NFT Puzzle) after having invested the minimum amount required", async () => {
      const { puzzleContract } = await loadFixture(
        investor1ReadyToClaimLevel3Piece
      );
      expect(
        await puzzleContract
          .connect(investor1)
          .verifyClaim(investor1.address, 3)
      ).not.to.be.reverted;
    });
    it("user should be able to claim when passing the requisites", async () => {
      const { puzzleContract } = await loadFixture(
        investor1ReadyToClaimLevel3Piece
      );
      await expect(puzzleContract.connect(investor1).claimPiece())
        .to.emit(puzzleContract, "TokensClaimed")
        .withArgs(investor1.address, anyValue);
    });
    it("user should not be able to reclaim while he hasnt invested enough", async () => {
      const { puzzleContract } = await loadFixture(
        investor1ReadyToClaimLevel3Piece
      );
      await puzzleContract.connect(investor1).claimPiece();
      await expect(
        puzzleContract.connect(investor1).claimPiece()
      ).to.be.revertedWithCustomError(
        logcisContract,
        "MissingInvestmentToClaim"
      );
    });
  });
  describe("Pre-claim FINAL NFT", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(
        investor1NotReadyToClaimLevel3Piece
      ));
    });
    it("Investor should not be able to burn without the required Puzzle NFTs", async () => {
      await expect(
        puzzleContract.connect(investor1).claimLevel()
      ).to.be.revertedWithCustomError(
        puzzleContract,
        "UserMustHaveCompletePuzzle"
      );
    });
  });
  describe("Claim FINAL NFT", async () => {
    beforeEach(async () => {
      ({ puzzleContract } = await loadFixture(investor1ReadyToClaimLevel3));
      await puzzleContract.connect(investor1).claimLevel();
      await puzzleContract.connect(investor1).mintTest(3);
    });
    it("Investor should be able to claim FINAL NFT", async () => {
      await expect(await puzzleContract.connect(investor1).claimLevel())
        .to.emit(puzzleContract, "TokensClaimed")
        .withArgs(investor1.address, 32);
    });
    it("Investor should have FINAL NFT on his wallet", async () => {
      await puzzleContract.connect(investor1).claimLevel();
      await expect(
        await puzzleContract.balanceOf(investor1.address, 32)
      ).to.be.eq(1);
    });
    it("Investor should be able to claim FINAL NFT having 20 Puzzle NFTs and still have 10 left", async () => {
      // Mint 10 more Puzzle NFTs to the investor
      await puzzleContract.connect(investor1).mintTest(3);
      // Fill the array with investor's address
      const accounts = new Array(10).fill(investor1.address);
      // Shallow-clone sliced collections array
      const NFTIds = [...COLLECTIONS.slice(20, 30)];
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
    it("Investor should not be able to call verifyClaim for FINAL NFT after owning the FINAL NFT token", async () => {
      await puzzleContract.connect(investor1).claimLevel();
      await expect(
        puzzleContract._userAllowedToBurnPuzzle(investor1.address, 32)
      ).to.revertedWithCustomError(puzzleContract, "IncorrectUserLevel");
    });
    it("Investor should not be able to claim FINAL NFT again", async () => {
      await puzzleContract.connect(investor1).claimLevel();

      await expect(
        puzzleContract.connect(investor1).claimLevel()
      ).to.be.revertedWithCustomError(puzzleContract, "IncorrectUserLevel");
    });
  });
  describe("Function calls", async () => {
    describe("_userAllowedToBurnPuzzle", () => {
      it("Should revert if the token sent is not valid", async () => {
        const { puzzleContract } = await loadFixture(deployContractFixture);
        await expect(
          puzzleContract._userAllowedToBurnPuzzle(investor1.address, 10003)
        ).to.revertedWith("Not a valid level token ID");
      });
    });
    describe("_getLevelTokenIds", () => {
      it("Should revert if the level sent is not valid", async () => {
        const { puzzleContract } = await loadFixture(deployContractFixture);
        await expect(
          puzzleContract._getLevelTokenIds(10003)
        ).to.revertedWithCustomError(puzzleContract, "InvalidLevel");
      });
      it("Should give valid level 2 tokenId", async () => {
        const { puzzleContract } = await loadFixture(deployContractFixture);
        const ids = await puzzleContract._getLevelTokenIds(2);
        expect(ids[0]).to.eq(30);
      });
      it("Should give valid level 3 tokenId", async () => {
        const { puzzleContract } = await loadFixture(deployContractFixture);
        const ids = await puzzleContract._getLevelTokenIds(3);
        expect(ids[1]).to.eq(31);
      });
    });
    describe("_getPuzzleCollectionIds", () => {
      it("Should revert if the level sent is not valid", async () => {
        const { puzzleContract } = await loadFixture(deployContractFixture);
        await expect(
          puzzleContract._getPuzzleCollectionIds(10003)
        ).to.revertedWithCustomError(puzzleContract, "InvalidLevel");
      });
    });
    describe("verifyClaim", () => {
      it("Should revert if the token id is not valid", async () => {
        const { puzzleContract } = await loadFixture(deployContractFixture);
        await expect(
          puzzleContract.verifyClaim(investor1.address, 10003)
        ).to.revertedWith("Not a valid id");
      });
    });
    describe("_dealWithPuzzleBurning", () => {
      it("Should revert if the level is not 30, 31 or 32", async () => {
        const { puzzleContract } = await loadFixture(deployContractFixture);
        await expect(
          puzzleContract._dealWithPuzzleBurningTest(investor1.address, 10003)
        ).to.revertedWithCustomError(puzzleContract, "InvalidLevel");
      });
      it("Should give valid level 2 tokenId", async () => {
        const { puzzleContract } = await loadFixture(deployContractFixture);
        const ids = await puzzleContract._getLevelTokenIds(2);
        expect(ids[0]).to.eq(30);
      });
      it("Should give valid level 3 tokenId", async () => {
        const { puzzleContract } = await loadFixture(deployContractFixture);
        const ids = await puzzleContract._getLevelTokenIds(3);
        expect(ids[1]).to.eq(31);
      });
    });
    describe("claimLevel", () => {
      it("Should revert if the token id is less than 30", async () => {
        const { puzzleContract } = await loadFixture(deployContractFixture);
        await expect(
          puzzleContract._claimLevelTest(investor1.address, 29)
        ).to.revertedWithCustomError(puzzleContract, "InvalidLevel");
      });
      it("Should revert if the token id is bigger than 32", async () => {
        const { puzzleContract } = await loadFixture(deployContractFixture);
        await expect(
          puzzleContract._claimLevelTest(investor1.address, 33)
        ).to.revertedWithCustomError(puzzleContract, "InvalidLevel");
      });
    });
    describe("claimPiece", () => {
      it("Should revert if the token id is 0", async () => {
        const { puzzleContract } = await loadFixture(deployContractFixture);
        await expect(
          puzzleContract._claimPieceTest(investor1.address, 0)
        ).to.revertedWithCustomError(puzzleContract, "InvalidLevel");
      });
      it("Should revert if the token id is bigger than 3", async () => {
        const { puzzleContract } = await loadFixture(deployContractFixture);
        await expect(
          puzzleContract._claimPieceTest(investor1.address, 4)
        ).to.revertedWithCustomError(puzzleContract, "InvalidLevel");
      });
    });

    describe("generateNewEntryBatch", () => {
      it("Caller should be CEO", async () => {
        const { puzzleContract, permissionsContract } = await loadFixture(
          deployContractFixtureWithoutBatch
        );
        await expect(
          puzzleContract.generateNewEntryBatch(10, 10, "")
        ).to.be.revertedWithCustomError(puzzleContract, "NotCEO");
      });
      // it("CEO should be able to call", async () => {
      //   const { puzzleContract, permissionsContract } = await loadFixture(
      //     deployContractFixtureWithoutBatch
      //   );
      //   await permissionsContract.pausePlatform();
      //   expect(
      //     await puzzleContract.generateNewEntryBatch(10, 10, "")
      //   ).to.be.revertedWithCustomError(puzzleContract, "NotCEO");
      // });
    });
  });
  describe("Reentrancy test", async () => {
    it("mintEntry", async () => {
      const { puzzleContract, paymentTokenContract, logcisContract } =
        await loadFixture(deployContractFixture);
      const mockFactory = new AttackSLCoreEntry__factory(owner);
      const mockContract = await mockFactory.deploy(puzzleContract.address);
      await paymentTokenContract.mint(100000000);
      await paymentTokenContract.transfer(mockContract.address, 100000000);
      await mockContract.approveERC20(
        paymentTokenContract.address,
        logcisContract.address,
        100000000
      );
      await expect(mockContract.startAttack()).to.be.revertedWith(
        "ReentrancyGuard: reentrant call"
      );
    });
    it("claimLevel", async () => {
      const { puzzleContract, paymentTokenContract, logcisContract } =
        await loadFixture(deployContractFixture);
      const mockFactory = new AttackSLCoreClaimLevel__factory(owner);
      const mockContract = await mockFactory.deploy(
        puzzleContract.address,
        paymentTokenContract.address,
        logcisContract.address,
        5_000_000_000
      );

      await expect(mockContract.startAttack()).to.be.revertedWith(
        "ReentrancyGuard: reentrant call"
      );
    });
    it("claimPiece", async () => {
      const {
        puzzleContract,
        paymentTokenContract,
        logcisContract,
        factoryContract,
      } = await loadFixture(deployContractFixture);

      const mockFactory = new AttackSLCoreClaimPiece__factory(owner);
      const investmentFactory = new Investment__factory(owner);
      await factoryContract
        .connect(ceo)
        .deployNew(
          200_000,
          paymentTokenContract.address,
          paymentTokenContract2.address,
          1
        );
      const investmentContract = investmentFactory.attach(
        await factoryContract.getLastDeployedContract(1)
      );

      const mockContract = await mockFactory.deploy(
        puzzleContract.address,
        paymentTokenContract.address,
        investmentContract.address,
        logcisContract.address,
        5_000_000_000
      );

      await expect(mockContract.startAttack()).to.be.revertedWith(
        "ReentrancyGuard: reentrant call"
      );
    });
  });
  describe("Pause/Unpause tests", async function () {
    //Write the testes for all functions of SLCore.sol that have the modifier isNotGloballyStopped when the platform is stopped
    it("Should not be called when the platform is paused", async () => {
      const { puzzleContract, permissionsContract } = await loadFixture(
        deployContractFixtureWithoutBatch
      );
      await permissionsContract.connect(ceo).pausePlatform();
      await expect(
        puzzleContract.generateNewEntryBatch(10, 10, "")
      ).to.be.revertedWithCustomError(puzzleContract, "PlatformPaused");
    });

    it("User should not be able the mint entry when mintEntry is paused", async () => {
      const { puzzleContract, permissionsContract } = await loadFixture(
        deployContractFixtureWithoutBatch
      );
      await permissionsContract.connect(ceo).pauseEntryMint();
      await expect(puzzleContract.mintEntry()).to.be.revertedWithCustomError(
        puzzleContract,
        "EntryMintPaused"
      );
    });
    describe("PuzzleMint Paused", async function () {
      it("User should not be able to call claimPiece when PuzzleMint is paused", async () => {
        const { puzzleContract, permissionsContract } = await loadFixture(
          deployContractFixtureWithoutBatch
        );
        await permissionsContract.connect(ceo).pausePuzzleMint();
        await expect(puzzleContract.claimPiece()).to.be.revertedWithCustomError(
          puzzleContract,
          "ClaimingPaused"
        );
      });
      it("User should not be able to call claimLevel when PuzzleMint is paused", async () => {
        const { puzzleContract, permissionsContract } = await loadFixture(
          deployContractFixtureWithoutBatch
        );
        await permissionsContract.connect(ceo).pausePuzzleMint();
        await expect(puzzleContract.claimLevel()).to.be.revertedWithCustomError(
          puzzleContract,
          "ClaimingPaused"
        );
      });
    });
  });
});
