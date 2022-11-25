import { Factory, Investment, Puzzle } from "../typechain-types";
import { CoinTest } from "../typechain-types/contracts/CoinTest";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Factory__factory } from "../typechain-types/factories/contracts/Factory__factory";
import { CoinTest__factory } from "../typechain-types/factories/contracts/CoinTest__factory";
import { Puzzle__factory } from "../typechain-types/factories/contracts/Puzzle.sol/Puzzle__factory";
import { BigNumber } from "ethers";
import { Investment__factory } from "../typechain-types/factories/contracts/Investment__factory";
const { expect } = require("chai");
const { ethers } = require("hardhat");

const MAX_PER_COLLECTION = 5;
const PAYMENT_TOKEN_AMOUNT = 20000;
const INVESTMENT1_AMOUNT = 100000;
const INVESTMENT2_AMOUNT = 150000;
const OWNER_INVESTMENT_AMOUNT = 5000;
const INVESTOR1_INVESTMENT_AMOUNT = 6000;
const INVESTOR2_INVESTMENT_AMOUNT = 5000;

describe("Something Legendary", async function () {
  let paymentTokenContract: CoinTest,
    factoryContract: Factory,
    puzzleContract: Puzzle,
    investmentContract: Investment,
    accounts: SignerWithAddress[],
    totalAccounts: number,
    owner: SignerWithAddress,
    investor1: SignerWithAddress,
    investor2: SignerWithAddress,
    investor3: SignerWithAddress,
    ownerBalanceBefore: BigNumber;

  beforeEach("Setup before run tests", async () => {
    // Get all signers
    accounts = await ethers.getSigners();
    totalAccounts = accounts.length;

    // Assign used accounts from all signers
    [owner, investor1, investor2, investor3] = accounts;
    const coinTestContractFactory = new CoinTest__factory(owner);
    const puzzleContractFactory = new Puzzle__factory(owner);
    const factoryContractFactory = new Factory__factory(owner);
    // Deploy CoinTest contract from the factory
    paymentTokenContract = await coinTestContractFactory.deploy();
    await paymentTokenContract.deployed();
    // Deploy Factory contract from the factory
    factoryContract = await factoryContractFactory.deploy();
    await factoryContract.deployed();
    // Deploy Puzzle contract from the factory passing Factory and CoinTest deployed contract addresses
    puzzleContract = await puzzleContractFactory.deploy(
      factoryContract.address,
      paymentTokenContract.address
    );
    await puzzleContract.deployed();
    // Set the Puzzle contract deployed as entry address on Factory contract
    await factoryContract.setEntryAddress(puzzleContract.address);

    // Set the owner balance before
    ownerBalanceBefore = await paymentTokenContract.balanceOf(owner.address);

    // Mint fake tokens to owner and user for tests
    await paymentTokenContract.mint(PAYMENT_TOKEN_AMOUNT);
    await paymentTokenContract.connect(investor1).mint(PAYMENT_TOKEN_AMOUNT);
    await paymentTokenContract.connect(investor2).mint(PAYMENT_TOKEN_AMOUNT);
    //Alow Puzzle contract to interact with these funds
    await paymentTokenContract.approve(
      puzzleContract.address,
      PAYMENT_TOKEN_AMOUNT
    );
    await paymentTokenContract
      .connect(investor1)
      .approve(puzzleContract.address, PAYMENT_TOKEN_AMOUNT);
    await paymentTokenContract
      .connect(investor2)
      .approve(puzzleContract.address, PAYMENT_TOKEN_AMOUNT);

    // const addressInvestment = await factoryContract.deployNew(
    //   INVESTMENT1_AMOUNT,
    //   paymentTokenContract.address
    // );
    // console.log("address:", addressInvestment);
  });
  describe("Tests for puzzle", () => {
    describe("Deployment", () => {
      // it("Should set the right owner", async () => {
      //   const contractOwner = await puzzleContract.owner();
      //   await expect(contractOwner).to.eq(owner.address);
      // });
      /**
       * If the owner has the ability to claim
       */
      // it("Sets the right max amount for each collection", async () => {
      //   const collections = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      //   collections.forEach(
      //     async (collection) =>
      //       await expect(
      //         await puzzleContract.getMaxCollection(collection)
      //       ).to.equal(MAX_PER_COLLECTION)
      //   );
      // });
      it("Set the factory address", async () => {
        const factoryAddressFromContract =
          await puzzleContract.factoryAddress();
        expect(factoryAddressFromContract).to.be.eq(factoryContract.address);
      });
      it("Set the payment token address", async () => {
        const paymentTokenAddressFromContract =
          await puzzleContract.paymentTokenAddress();
        expect(paymentTokenAddressFromContract).to.be.eq(
          paymentTokenContract.address
        );
      });
    });
    describe("Mint the entry NFT", async () => {
      it("Owner should have enough payment token to be able to mint", async () => {
        const expectedOwnerTokenAmount = await paymentTokenContract.balanceOf(
          owner.address
        );

        expect(expectedOwnerTokenAmount).to.be.eq(
          ownerBalanceBefore.add(PAYMENT_TOKEN_AMOUNT)
        );
      });
      it("Owner should be able to mint", async () => {
        await expect(await puzzleContract.mintEntry())
          .to.emit(puzzleContract, "Minted")
          .withArgs(10, 1);
      });
      it("User with enough funds should be able to mint", async () => {
        await expect(await puzzleContract.connect(investor1).mintEntry())
          .to.emit(puzzleContract, "Minted")
          .withArgs(10, 1);
        const investor1HasEntryNFT = await puzzleContract.balanceOf(
          investor1.address,
          10
        );
        expect(investor1HasEntryNFT).to.be.eq(1);
      });
      it("User without allowing to spend funds should not be able to mint", async () => {
        await expect(
          puzzleContract.connect(investor3).mintEntry()
        ).to.be.revertedWith("ERC20: insufficient allowance");
      });
      it("User without enough funds should not be able to mint", async () => {
        await paymentTokenContract
          .connect(investor3)
          .approve(puzzleContract.address, PAYMENT_TOKEN_AMOUNT);
        await expect(
          puzzleContract.connect(investor3).mintEntry()
        ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      });
      it("User should not be able to have more than 1 NFTEntry", async () => {
        await expect(await puzzleContract.connect(investor2).mintEntry()).to.not
          .be.reverted;
        await expect(
          puzzleContract.connect(investor2).mintEntry()
        ).to.be.revertedWith("Cannot have more than 1");
      });
      it("Should not be able to mint more than collection limit", async () => {
        accounts.map(async (account, i) => {
          if (i >= 3) {
            await paymentTokenContract
              .connect(account)
              .mint(PAYMENT_TOKEN_AMOUNT);
            await paymentTokenContract
              .connect(account)
              .approve(puzzleContract.address, PAYMENT_TOKEN_AMOUNT);
          }
        });
        for (let i = 0; i <= totalAccounts - 2; i++) {
          await puzzleContract.connect(accounts[i]).mintEntry();
        }
        await expect(
          puzzleContract.connect(accounts[totalAccounts - 1]).mintEntry()
        ).to.be.revertedWith("Collection limit reached");
      });
    });
    /*
    describe("Test claim of NFT Puzzle", async () => {
      beforeEach(async () => {
        // Mint Entry NFT for the owner
        await puzzleContract.mintEntry();
        // Mint Entry NFT for investor1
        await puzzleContract.connect(investor1).mintEntry();
        // Mint Entry NFT for investor2
        await puzzleContract.connect(investor2).mintEntry();
        //Create Investment contract instance
        const deployNewTx = await factoryContract.deployNew(
          INVESTMENT1_AMOUNT,
          paymentTokenContract.address
        );
        // deployNewTx.wait();
        const deployedInvestmentAddress =
          await factoryContract.getLastDeployedContract();
        const investmentFactory = new Investment__factory(owner);
        investmentContract = investmentFactory.attach(
          deployedInvestmentAddress
        );
        // Invest an amount for each investor
        await investmentContract.invest(OWNER_INVESTMENT_AMOUNT);
        await investmentContract
          .connect(investor1)
          .invest(INVESTOR1_INVESTMENT_AMOUNT);
        await investmentContract
          .connect(investor2)
          .invest(INVESTOR2_INVESTMENT_AMOUNT);
        // console.log(await InvestmentContract.balanceOf(investor1.address));
      });

      it("User should be able to claim a NFT Puzzle after having invested at least 5k", async () => {
        // expect(1).to.be.equal(1);
        expect(await puzzleContract.verifyClaim(owner.address)).to.equal(true);
      });
    });

    */
    describe("Burn", () => {
      beforeEach(async () => {
        // PuzzleContract.burn

        // Call mint test for the owner
        await puzzleContract.mintTest();
        // Call mint test for investor1
        await puzzleContract.connect(investor1).mintTest();
      });
      it("User should not be allowed to interact with claim() and verifyClaim() without nftentry", async () => {
        await expect(
          puzzleContract.verifyBurn(investor1.address)
        ).to.be.revertedWith("Not accessible");
        await expect(
          puzzleContract.connect(investor1).burn()
        ).to.be.revertedWith("Not accessible");
      });
      it("User should pass on verifyBurn if they have invested enough", async () => {
        //Mint entry
        await puzzleContract.mintEntry();
        await puzzleContract.connect(investor1).mintEntry();
        //Run test
        await puzzleContract.connect(investor1).mintTest();
        expect(
          await puzzleContract.verifyBurn(investor1.address)
        ).to.deep.equal([
          true,
          [
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
          ],
          [
            BigNumber.from(0),
            BigNumber.from(1),
            BigNumber.from(2),
            BigNumber.from(3),
            BigNumber.from(4),
            BigNumber.from(5),
            BigNumber.from(6),
            BigNumber.from(7),
            BigNumber.from(8),
            BigNumber.from(9),
          ],
        ]);
      });
      it("Owner should pass on verifyBurn if they have invested enough", async () => {
        //Mint entry
        await puzzleContract.mintEntry();
        await puzzleContract.connect(investor1).mintEntry();
        //Run test
        await puzzleContract.mintTest();
        expect(await puzzleContract.verifyBurn(owner.address)).to.deep.equal([
          true,
          [
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
          ],
          [
            BigNumber.from(0),
            BigNumber.from(1),
            BigNumber.from(2),
            BigNumber.from(3),
            BigNumber.from(4),
            BigNumber.from(5),
            BigNumber.from(6),
            BigNumber.from(7),
            BigNumber.from(8),
            BigNumber.from(9),
          ],
        ]);
      });
      it("owner should be able to burn", async () => {
        //Mint entry
        await puzzleContract.mintEntry();
        await puzzleContract.connect(investor1).mintEntry();
        //Run test
        await puzzleContract.mintTest();
        await expect(await puzzleContract.burn())
          .to.emit(puzzleContract, "Burned")
          .withArgs(true);
      });
      it("User should be able to burn", async () => {
        //Mint entry
        await puzzleContract.mintEntry();
        await puzzleContract.connect(investor1).mintEntry();
        //Run test
        await puzzleContract.connect(investor1).mintTest();
        await expect(await puzzleContract.connect(investor1).burn())
          .to.emit(puzzleContract, "Burned")
          .withArgs(true);
      });
      it("owner should pass verifyBurn() having 11+ tokens", async () => {
        //Mint entry
        await puzzleContract.mintEntry();
        await puzzleContract.connect(investor1).mintEntry();
        //Run test
        await puzzleContract.connect(owner).mintTest();
        await puzzleContract.connect(owner).mintTest();
        expect(await puzzleContract.verifyBurn(owner.address)).to.deep.equal([
          true,
          [
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
            BigNumber.from(1),
          ],
          [
            BigNumber.from(0),
            BigNumber.from(1),
            BigNumber.from(2),
            BigNumber.from(3),
            BigNumber.from(4),
            BigNumber.from(5),
            BigNumber.from(6),
            BigNumber.from(7),
            BigNumber.from(8),
            BigNumber.from(9),
          ],
        ]);
      });
      it("User should be able to burn having 11+ tokens", async () => {
        //Mint entry
        await puzzleContract.mintEntry();
        await puzzleContract.connect(investor1).mintEntry();
        //Run test
        await puzzleContract.connect(owner).mintTest();
        await puzzleContract.connect(owner).mintTest();
        expect(await puzzleContract.connect(owner).burn())
          .to.emit(puzzleContract, "Burned")
          .withArgs(true);
      });
      it("Owner should be able to burn having 20 tokens and still have 10", async () => {
        //Mint entry
        await puzzleContract.mintEntry();
        await puzzleContract.connect(investor1).mintEntry();
        //Run test
        await puzzleContract.mintTest();
        expect(await puzzleContract.burn())
          .to.emit(puzzleContract, "Burned")
          .withArgs(true);
        expect(await puzzleContract.balanceOf(owner.address, 1)).to.equal(1);
      });
      it("User should be able to burn having 20 tokens and still have 10", async () => {
        //Mint entry
        await puzzleContract.mintEntry();
        await puzzleContract.connect(investor1).mintEntry();
        //Run test
        await puzzleContract.connect(investor1).mintTest();
        expect(await puzzleContract.connect(investor1).burn()).to.emit(true);
        expect(await puzzleContract.balanceOf(investor1.address, 0)).to.equal(
          1
        );
        expect(await puzzleContract.balanceOf(investor1.address, 1)).to.equal(
          1
        );
        expect(await puzzleContract.balanceOf(investor1.address, 2)).to.equal(
          1
        );
        expect(await puzzleContract.balanceOf(investor1.address, 3)).to.equal(
          1
        );
        expect(await puzzleContract.balanceOf(investor1.address, 4)).to.equal(
          1
        );
        expect(await puzzleContract.balanceOf(investor1.address, 5)).to.equal(
          1
        );
        expect(await puzzleContract.balanceOf(investor1.address, 6)).to.equal(
          1
        );
        expect(await puzzleContract.balanceOf(investor1.address, 7)).to.equal(
          1
        );
        expect(await puzzleContract.balanceOf(investor1.address, 8)).to.equal(
          1
        );
        expect(await puzzleContract.balanceOf(investor1.address, 9)).to.equal(
          1
        );
      });

      /*
      it("User should not be allowed to burn twice (have more than 1 NFTLevel2)", async () => {
        //Mint entry
        await puzzleContract.mintEntry();
        await puzzleContract.connect(investor1).mintEntry();
        //Run test
        await puzzleContract.connect(owner).mintTest();
        await puzzleContract.connect(owner).mintTest();
        await puzzleContract.connect(owner).burn();
        await expect(puzzleContract.connect(owner).burn()).to.be.revertedWith(
          "Cannot have more than 1"
        );
      });
      */
    });
    describe("Metadata", async () => {
      it("Get the right metadata", async () => {
        expect(await puzzleContract.tokenURI(1)).to.equal(
          "ipfs://bafybeiemgzx3i5wa5cw47kpyz44m3t76crqdahe5onjibmgmpshjiivnjm/1.json"
        );
      });
      it("Get the right metadata via uri() function", async () => {
        expect(await puzzleContract.uri(1)).to.equal(
          "ipfs://bafybeiemgzx3i5wa5cw47kpyz44m3t76crqdahe5onjibmgmpshjiivnjm/1.json"
        );
      });
    });
  });
  /*
  describe("Tests for Factory", async () => {
    describe("Deploy:", async () => {
      it("Factory should have the right owner", async () => {
        expect(await factoryContract.owner()).to.equal(owner.address);
      });
      it("Factory should be able to deploy 1 contract", async () => {
        await expect(
          await factoryContract.deployNew(100000, paymentTokenContract.address)
        )
          .to.emit(factoryContract, "ContractCreated")
          .withArgs(2); //Chenged to 2 beacuse beforeEach creates a investment contract. Change: 1 -> 2
      });
      it("Factory should be able to deploy 2 contracts", async () => {
        // const currentCounter = await factoryContract.co
        // console.log(await);
        await expect(
          await factoryContract.deployNew(100000, paymentTokenContract.address)
        )
          .to.emit(factoryContract, "ContractCreated")
          .withArgs(2);
        await expect(
          await factoryContract.deployNew(500000, paymentTokenContract.address)
        )
          .to.emit(factoryContract, "ContractCreated")
          .withArgs(3);
      });
    });
  });
  */

  /*
  describe("Combined tests", () => {
    describe("Deploy", () => {
      it("Set the same owner for both contracts", async () => {
        expect(await factoryContract.owner()).to.equal(
          await puzzleContract.owner()
        );
        expect(await factoryContract.owner()).to.equal(owner.address);
      });
    });
  });
  */
});
