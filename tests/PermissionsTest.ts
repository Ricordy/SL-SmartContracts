import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
  CoinTest,
  CoinTest__factory,
  Factory,
  Factory__factory,
  SLCoreTest,
  SLCoreTest__factory,
  SLLogics,
  SLLogics__factory,
  SLPermissions,
  SLPermissions__factory,
} from "../typechain-types";

// Constants
const ENTRY_BATCH_CAP = 1000,
  ENTRY_BATCH_PRICE = 100,
  ENTRY_TOKEN_URI = "TOKEN_URI";

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

  async function pauseAllButPlatform() {
    const { permissionsContract } = await loadFixture(deployContractFixture);
    await permissionsContract.connect(ceo).pauseEntryMint();
    await permissionsContract.connect(ceo).pauseInvestments();
    await permissionsContract.connect(ceo).pausePuzzleMint();

    return {
      ceo,
      permissionsContract,
    };
  }

  async function pausedPlatform() {
    const { permissionsContract } = await loadFixture(deployContractFixture);
    await permissionsContract.connect(ceo).pausePlatform();

    return {
      ceo,
      permissionsContract,
    };
  }

  describe("Deployment tests", async () => {
    it("Should set the CEO address", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.isCEO(ceo.address)).to.be.true;
    });
    it("CEO Should be CLevel", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.isCLevel(ceo.address)).to.be.true;
    });
    it("Should set the CFO address", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.isCFO(cfo.address)).to.be.true;
    });
    it("CFO Should be CLevel", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);

      expect(await permissionsContract.isCLevel(cfo.address)).to.be.true;
    });

    it("Platform should be unpaused", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.isPlatformPaused()).to.be.false;
    });

    it("Investments should be unpaused", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.isInvestmentsPaused()).to.be.false;
    });

    it("Claim should be unpaused", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.isClaimPaused()).to.be.false;
    });

    it("Entry mint should be unpaused", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.isEntryMintPaused()).to.be.false;
    });
  });
  describe("Pause/Unpause tests", async () => {
    it("CEO should be able to pause entry mint", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.connect(ceo).pauseEntryMint()).to.not
        .reverted;
    });
    it("CFO should be able to pause entry mint", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.connect(cfo).pauseEntryMint()).to.not
        .reverted;
    });

    it("CEO should be able to pause investments", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.connect(ceo).pauseInvestments()).to.not
        .reverted;
    });
    it("CFO should be able to pause investments", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.connect(cfo).pauseInvestments()).to.not
        .reverted;
    });

    it("CEO should be able to pause puzzle mint", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.connect(ceo).pausePuzzleMint()).to.not
        .reverted;
    });
    it("CFO should be able to pause puzzle mint", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.connect(cfo).pausePuzzleMint()).to.not
        .reverted;
    });

    it("CEO should be able to pause platform", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.connect(ceo).pausePlatform()).to.not
        .reverted;
    });
    it("CFO should be able to pause platform", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.connect(cfo).pausePlatform()).to.not
        .reverted;
    });

    it("CEO should be able to unpause entry mint", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.connect(ceo).unpauseEntryMint()).to.not
        .reverted;
    });

    it("CEO should be able to unpause investments", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.connect(ceo).unpauseInvestments()).to.not
        .reverted;
    });

    it("CEO should be able to unpause platform", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.connect(ceo).unpausePlatform()).to.not
        .reverted;
    });

    it("CEO should be able to unpause puzzle mint", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.connect(ceo).unpausePuzzleMint()).to.not
        .reverted;
    });

    it("NOT CLevel should NOT be able to pause platform", async () => {
      const { investor1, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(permissionsContract.connect(investor1).pausePlatform()).to.be
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

    describe("when some functionalities are paused, the platform should reflect that", () => {
      it("Mint entry should be paused ", async () => {
        const { permissionsContract } = await loadFixture(pauseAllButPlatform);
        expect(await permissionsContract.isEntryMintPaused()).to.be.true;
      });
      it("Investments should be paused ", async () => {
        const { permissionsContract } = await loadFixture(pauseAllButPlatform);
        expect(await permissionsContract.isInvestmentsPaused()).to.be.true;
      });
      it("Claim should be paused ", async () => {
        const { permissionsContract } = await loadFixture(pauseAllButPlatform);
        expect(await permissionsContract.isClaimPaused()).to.be.true;
      });
      it("Platform should be paused  ", async () => {
        const { permissionsContract } = await loadFixture(pausedPlatform);
        expect(await permissionsContract.isPlatformPaused()).to.be.true;
      });
      it("When platform is paused Mint entry automatically becomes paused", async () => {
        const { permissionsContract } = await loadFixture(pausedPlatform);
        expect(await permissionsContract.isEntryMintPaused()).to.be.true;
      });
      it("When platform is paused Investments automatically becomes paused", async () => {
        const { permissionsContract } = await loadFixture(pausedPlatform);
        expect(await permissionsContract.isInvestmentsPaused()).to.be.true;
      });
      it("When platform is paused Claim automatically becomes paused", async () => {
        const { permissionsContract } = await loadFixture(pausedPlatform);
        expect(await permissionsContract.isClaimPaused()).to.be.true;
      });
    });
  });

  describe("Setting Roles tests", async () => {
    it("CEO should be able to set CEO", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.connect(ceo).setCEO(cfo.address)).to.not
        .reverted;
    });

    it("CEO should be able to set CFO", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      expect(await permissionsContract.connect(ceo).setCFO(ceo.address)).to.not
        .reverted;
    });

    it("CFO should NOT be able to set new CEO", async () => {
      const { investor1, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(
        permissionsContract.connect(cfo).setCEO(investor1.address)
      ).to.be.revertedWithCustomError(permissionsContract, "NotCEO");
    });

    it("CFO should NOT be able to set new CFO", async () => {
      const { investor1, permissionsContract } = await loadFixture(
        deployContractFixture
      );
      await expect(
        permissionsContract.connect(cfo).setCFO(investor1.address)
      ).to.be.revertedWithCustomError(permissionsContract, "NotCEO");
    });

    it("CEO should NOT be able to set new CEO to zero address", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      await expect(
        permissionsContract.connect(ceo).setCEO(ethers.constants.AddressZero)
      ).to.be.revertedWithCustomError(permissionsContract, "InvalidAddress");
    });

    it("CEO should NOT be able to set new CFO to zero address", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      await expect(
        permissionsContract.connect(ceo).setCFO(ethers.constants.AddressZero)
      ).to.be.revertedWithCustomError(permissionsContract, "InvalidAddress");
    });
    it("CEO should not be able to set allowed contracts passing the wrong _allowed value", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      await expect(
        permissionsContract.connect(ceo).setAllowedContracts(cfo.address, 2)
      ).to.be.revertedWithCustomError(permissionsContract, "InvalidNumber");
    });

    it("CFO should not be able to set allowed contracts", async () => {
      const { permissionsContract } = await loadFixture(deployContractFixture);
      await expect(
        permissionsContract.connect(cfo).setAllowedContracts(cfo.address, 1)
      ).to.be.revertedWithCustomError(permissionsContract, "NotCEO");
    });
  });
});
