import { Factory, Puzzle } from "../typechain-types";
import { CoinTest } from "../typechain-types/contracts/CoinTest";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
const { expect, should } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

describe("Something Legendary", async function () {
  let CoinContract: CoinTest,
    FactoryContract: Factory,
    PuzzleContract: Puzzle,
    InvestmentContract,
    accounts: SignerWithAddress[];

  beforeEach("Runned beforeEach", async () => {
    const facCoin = await ethers.getContractFactory("CoinTest");
    const facPuzzle = await ethers.getContractFactory("Puzzle");
    const facFac = await ethers.getContractFactory("Factory");
    accounts = await ethers.getSigners();
    CoinContract = await facCoin.deploy();
    await CoinContract.deployed();
    FactoryContract = await facFac.deploy();
    await FactoryContract.deployed();
    PuzzleContract = await facPuzzle.deploy(
      FactoryContract.address,
      CoinContract.address
    );
    await PuzzleContract.deployed();

    await FactoryContract.setEntryAddress(PuzzleContract.address);

    // //Mint fake tokens to accounts[0] and user for tests
    await CoinContract.mint(20000);
    await CoinContract.connect(accounts[1]).mint(20000);
    await CoinContract.connect(accounts[2]).mint(20000);
    //Alow 1155 contract to interact with these funds
    await CoinContract.approve(PuzzleContract.address, 20000);
    await CoinContract.connect(accounts[1]).approve(
      PuzzleContract.address,
      20000
    );
    await CoinContract.connect(accounts[2]).approve(
      PuzzleContract.address,
      20000
    );

    await FactoryContract.deployNew("100000");
    const addressInvestment = await FactoryContract.getLastDeployedContract();
    //Compute address given by Factory
    const add = ethers.utils.computeAddress(addressInvestment.hash);
    //Create Investment contract instance
    const InvestmentFac = await ethers.getContractFactory("Investment");
    InvestmentContract = InvestmentFac.attach(add);
    //Invest 10k for each wallet

    await InvestmentContract.invest(5000);
    await InvestmentContract.connect(accounts[1]).invest(6000);
    await InvestmentContract.connect(accounts[2]).invest(5000);
  });

  describe("First task", async () => {
    describe("Tests for puzzle", () => {
      describe("Deployment", () => {
        it("Should set the right accounts[0]", async () => {
          await expect(await PuzzleContract.owner()).to.equal(
            accounts[0].address
          );
          console.log("accounts tot: " + accounts.length);
        });
        /**
         * If the accounts[0] has the ability to claim
         */
        it("Sets the right max amount for each collection", async () => {
          const collections = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
          collections.forEach(
            async (collection) =>
              await expect(
                await PuzzleContract.getMaxCollection(collection)
              ).to.equal(1000)
          );
        });
      });
      describe("Mint Entry", async () => {
        it("owner should be able to mint", async () => {
          await expect(await PuzzleContract.mintEntry())
            .to.emit(PuzzleContract, "Minted")
            .withArgs(10, 1);
        });

        it("User should be able to mint", async () => {
          await expect(await PuzzleContract.connect(accounts[1]).mintEntry())
            .to.emit(PuzzleContract, "Minted")
            .withArgs(10, 1);
        });
        it("User should not be able to have more than 1 NFTEntry", async () => {
          await expect(await PuzzleContract.connect(accounts[2]).mintEntry()).to
            .not.be.reverted;
          await expect(
            PuzzleContract.connect(accounts[2]).mintEntry()
          ).to.be.revertedWith("Cannot have more than 1");
        });
        it("Should not be able to mint more than collection limit", async () => {
          accounts.map(async (account, i) => {
            if (i >= 3) {
              await CoinContract.connect(account).mint(20000);
              await CoinContract.connect(account).approve(
                PuzzleContract.address,
                20000
              );
            }
          });
          for (let i = 0; i <= 4; i++) {
            await PuzzleContract.connect(accounts[i]).mintEntry();
          }
          await expect(
            PuzzleContract.connect(accounts[5]).mintEntry()
          ).to.be.revertedWith("Collection limit reached");
        });
      });
      describe("Burn", () => {
        it("owner should be able to claim", async () => {
          await PuzzleContract.mintTest();
          expect(
            await PuzzleContract.verifyBurn(accounts[0].address)
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
        it("owner should be able to burn", async () => {
          await PuzzleContract.mintTest();
          await expect(await PuzzleContract.burn())
            .to.emit(PuzzleContract, "Burned")
            .withArgs(true);
        });
        it("User should be able to claim", async () => {
          await PuzzleContract.connect(accounts[1]).mintTest();
          expect(
            await PuzzleContract.verifyBurn(accounts[1].address)
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
        it("User should be able to burn", async () => {
          await PuzzleContract.connect(accounts[1]).mintTest();
          await expect(await PuzzleContract.connect(accounts[1]).burn())
            .to.emit(PuzzleContract, "Burned")
            .withArgs(true);
        });
        it("owner should pass verifyBurn() having 11+ tokens", async () => {
          await PuzzleContract.connect(accounts[0]).mintTest();
          await PuzzleContract.connect(accounts[0]).mintTest();
          expect(
            await PuzzleContract.verifyBurn(accounts[0].address)
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
        it("User should be able to burn having 11+ tokens", async () => {
          await PuzzleContract.connect(accounts[0]).mintTest();
          await PuzzleContract.connect(accounts[0]).mintTest();
          expect(await PuzzleContract.connect(accounts[0]).burn())
            .to.emit(PuzzleContract, "Burned")
            .withArgs(true);
        });
        it("owner should be able to burn having 20 tokens and still have 10", async () => {
          await PuzzleContract.mintTest();
          await PuzzleContract.mintTest();
          expect(await PuzzleContract.burn())
            .to.emit(PuzzleContract, "Burned")
            .withArgs(true);
          expect(
            await PuzzleContract.balanceOf(accounts[0].address, 1)
          ).to.equal(1);
        });
        it("User should be able to burn having 20 tokens and still have 10", async () => {
          await PuzzleContract.connect(accounts[1]).mintTest();
          await PuzzleContract.connect(accounts[1]).mintTest();
          expect(await PuzzleContract.connect(accounts[1]).burn()).to.emit(
            true
          );
          expect(
            await PuzzleContract.balanceOf(accounts[1].address, 0)
          ).to.equal(1);
          expect(
            await PuzzleContract.balanceOf(accounts[1].address, 1)
          ).to.equal(1);
          expect(
            await PuzzleContract.balanceOf(accounts[1].address, 2)
          ).to.equal(1);
          expect(
            await PuzzleContract.balanceOf(accounts[1].address, 3)
          ).to.equal(1);
          expect(
            await PuzzleContract.balanceOf(accounts[1].address, 4)
          ).to.equal(1);
          expect(
            await PuzzleContract.balanceOf(accounts[1].address, 5)
          ).to.equal(1);
          expect(
            await PuzzleContract.balanceOf(accounts[1].address, 6)
          ).to.equal(1);
          expect(
            await PuzzleContract.balanceOf(accounts[1].address, 7)
          ).to.equal(1);
          expect(
            await PuzzleContract.balanceOf(accounts[1].address, 8)
          ).to.equal(1);
          expect(
            await PuzzleContract.balanceOf(accounts[1].address, 9)
          ).to.equal(1);
        });
      });
      describe("Metadata", () => {
        it("Get the right metadata", async () => {
          expect(await PuzzleContract.tokenURI(1)).to.equal(
            "ipfs://bafybeiemgzx3i5wa5cw47kpyz44m3t76crqdahe5onjibmgmpshjiivnjm/1.json"
          );
        });
        it("Get the right metadata via uri() function", async () => {
          expect(await PuzzleContract.uri(1)).to.equal(
            "ipfs://bafybeiemgzx3i5wa5cw47kpyz44m3t76crqdahe5onjibmgmpshjiivnjm/1.json"
          );
        });
      });
    });
    describe("Tests for Factory", async () => {
      describe("Deploy:", async () => {
        it("Factory should have the right owner", async () => {
          expect(await FactoryContract.owner()).to.equal(accounts[0].address);
        });
        it("Factory should be able to deploy 1 contract", async () => {
          await expect(await FactoryContract.deployNew(100000))
            .to.emit(FactoryContract, "ContractCreated")
            .withArgs(2);
        });
        it("Factory should be able to deploy 2 contracts", async () => {
          await expect(await FactoryContract.deployNew(100000))
            .to.emit(FactoryContract, "ContractCreated")
            .withArgs(2);
          await expect(await FactoryContract.deployNew(500000))
            .to.emit(FactoryContract, "ContractCreated")
            .withArgs(3);
        });
      });
    });
    describe("Combined tests", () => {
      describe("Deploy", () => {
        it("Set the same owner for both contracts", async () => {
          expect(await FactoryContract.owner()).to.equal(
            await PuzzleContract.owner()
          );
          expect(await FactoryContract.owner()).to.equal(accounts[0].address);
        });
      });
    });
  });
});
