import {
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
describe("Permissions Contract", async () => {
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
    const puzzleContractFactory = new SLCoreTest__factory(owner);
    const logicsContractFactory = new SLLogics__factory(owner);
    const factoryContractFactory = new Factory__factory(owner);
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
      permissionsContract,
      puzzleContract,
      factoryContract,
      logcisContract,
    };
  }

  describe("Deployment tests", async () => {
    it("Should set the CEO address", async () => {
      const { ceo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      expect(await permissionsContract.isCEO(ceo.address)).to.be.true;
      expect(await permissionsContract.isCLevel(ceo.address)).to.be.true;
    });
    it("Should set the CFO address", async () => {
      const { cfo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      expect(await permissionsContract.isCFO(cfo.address)).to.be.true;
      expect(await permissionsContract.isCLevel(cfo.address)).to.be.true;
    });

    it("Platform should be unpaused", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.isInvestmentsPaused()).to.be.false;
      expect(await permissionsContract.isClaimPaused()).to.be.false;
      expect(await permissionsContract.isEntryMintPaused()).to.be.false;
      expect(await permissionsContract.isPlatformPaused()).to.be.false;
    });
  });
  describe("Pause/Unpause tests", async () => {
    it("CLevel should be able to pause entry mint", async () => {
      const { ceo, cfo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      expect(await permissionsContract.connect(ceo).pauseEntryMint()).to.not
        .reverted;
      expect(await permissionsContract.connect(cfo).pauseEntryMint()).to.not
        .reverted;
    });

    it("CLevel should be able to pause investments", async () => {
      const { ceo, cfo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      expect(await permissionsContract.connect(ceo).pauseInvestments()).to.not
        .reverted;
      expect(await permissionsContract.connect(cfo).pauseInvestments()).to.not
        .reverted;
    });

    it("CLevel should be able to pause puzzle mint", async () => {
      const { ceo, cfo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      expect(await permissionsContract.connect(ceo).pausePuzzleMint()).to.not
        .reverted;
      expect(await permissionsContract.connect(cfo).pausePuzzleMint()).to.not
        .reverted;
    });

    it("CLevel should be able to pause platform", async () => {
      const { ceo, cfo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      expect(await permissionsContract.connect(ceo).pausePlatform()).to.not
        .reverted;
      expect(await permissionsContract.connect(cfo).pausePlatform()).to.not
        .reverted;
    });

    it("CEO should be able to unpause entry mint", async () => {
      const { ceo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      expect(await permissionsContract.connect(ceo).unpauseEntryMint()).to.not
        .reverted;
    });

    it("CEO should be able to unpause investments", async () => {
      const { ceo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      expect(await permissionsContract.connect(ceo).unpauseInvestments()).to.not
        .reverted;
    });

    it("CEO should be able to unpause platform", async () => {
      const { ceo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      expect(await permissionsContract.connect(ceo).unpausePlatform()).to.not
        .reverted;
    });

    it("CEO should be able to unpause puzzle mint", async () => {
      const { ceo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      expect(await permissionsContract.connect(ceo).unpausePuzzleMint()).to.not
        .reverted;
    });

    it("Not CLevel should not be able to pause entry mint", async () => {
      const { investor1, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(permissionsContract.connect(investor1).pauseEntryMint()).to
        .reverted;
    });

    it("Not CLevel should not be able to pause investments", async () => {
      const { investor1, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(permissionsContract.connect(investor1).pauseInvestments()).to
        .reverted;
    });

    it("Not CLevel should not be able to pause puzzle mint", async () => {
      const { investor1, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(permissionsContract.connect(investor1).pausePuzzleMint()).to
        .reverted;
    });
    it("Not CEO should not be able to unpause entry mint", async () => {
      const { investor1, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(permissionsContract.connect(investor1).unpauseEntryMint()).to
        .reverted;
    });

    it("Not CEO should not be able to unpause investments", async () => {
      const { investor1, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(permissionsContract.connect(investor1).unpauseInvestments())
        .to.reverted;
    });

    it("Not CEO should not be able to unpause puzzle mint", async () => {
      const { investor1, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(permissionsContract.connect(investor1).unpausePuzzleMint())
        .to.reverted;
    });

    it("Not CEO should not be able to unpause platform", async () => {
      const { investor1, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(permissionsContract.connect(investor1).unpausePlatform()).to
        .reverted;
    });

    it("CEO should not be able to unpause entry mint", async () => {
      const { cfo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(permissionsContract.connect(cfo).unpauseEntryMint()).to
        .reverted;
    });

    it("CEO should not be able to unpause investments", async () => {
      const { cfo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(permissionsContract.connect(cfo).unpauseInvestments()).to
        .reverted;
    });

    it("CEO should not be able to unpause puzzle mint", async () => {
      const { cfo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(permissionsContract.connect(cfo).unpausePuzzleMint()).to
        .reverted;
    });

    it("CEO should not be able to unpause platform", async () => {
      const { cfo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(permissionsContract.connect(cfo).unpausePlatform()).to
        .reverted;
    });
  });

  describe("Setting Roles tests", async () => {
    it("CEO should be able to set CEO", async () => {
      const { ceo, cfo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      expect(await permissionsContract.connect(ceo).setCEO(cfo.address)).to.not
        .reverted;
    });

    it("CEO should be able to set CFO", async () => {
      const { ceo, cfo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      expect(await permissionsContract.connect(ceo).setCFO(ceo.address)).to.not
        .reverted;
    });

    it("CFO should NOT be able to set new CEO", async () => {
      const { ceo, cfo, investor1, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(
        permissionsContract.connect(cfo).setCEO(investor1.address)
      ).to.be.revertedWithCustomError(permissionsContract, "NotCEO");
    });

    it("CFO should NOT be able to set new CFO", async () => {
      const { ceo, cfo, investor1, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(
        permissionsContract.connect(cfo).setCFO(investor1.address)
      ).to.be.revertedWithCustomError(permissionsContract, "NotCEO");
    });

    it("CEO should NOT be able to set new CEO to zero address", async () => {
      const { ceo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(
        permissionsContract.connect(ceo).setCEO(ethers.constants.AddressZero)
      ).to.be.revertedWithCustomError(permissionsContract, "InvalidAddress");
    });

    it("CEO should NOT be able to set new CFO to zero address", async () => {
      const { ceo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(
        permissionsContract.connect(ceo).setCFO(ethers.constants.AddressZero)
      ).to.be.revertedWithCustomError(permissionsContract, "InvalidAddress");
    });
    it("CEO should not be able to set allowed contracts passing the wrong _allowed value", async () => {
      const { ceo, cfo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(
        permissionsContract.connect(ceo).setAllowedContracts(cfo.address, 2)
      ).to.be.revertedWithCustomError(permissionsContract, "InvalidNumber");
    });

    it("CFO should not be able to set allowed contracts", async () => {
      const { ceo, cfo, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(
        permissionsContract.connect(cfo).setAllowedContracts(cfo.address, 1)
      ).to.be.revertedWithCustomError(permissionsContract, "NotCEO");
    });
  });
});
