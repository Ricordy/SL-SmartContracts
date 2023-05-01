import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { describe } from 'mocha'
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
} from '../typechain-types'

const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs')

const INVESTMENT_1_AMOUNT = 100000,
  INVESTMENT_2_AMOUNT = 200000,
  INVESTMENT_3_AMOUNT = 300000,
  CONTRACT_NUMBER_ID = 1,
  ENTRY_BATCH_CAP_1 = 1000,
  ENTRY_BATCH_CAP_2 = 100,
  ENTRY_BATCH_CAP_3 = 2,
  ENTRY_BATCH_PRICE_1 = 100,
  ENTRY_BATCH_PRICE_2 = 150,
  INVESTED_LEVEL_1 = INVESTMENT_1_AMOUNT / 10,
  INVESTED_LEVEL_2 = INVESTMENT_2_AMOUNT / 10,
  INVESTED_LEVEL_3 = INVESTMENT_3_AMOUNT / 10,
  ENTRY_TOKEN_URI = 'TOKEN_URI',
  ENTRY_LEVEL_NFT_ID_1 = 1000, // 01000 batch - 0, cap - 1000
  ENTRY_LEVEL_NFT_ID_2 = 10100, // 10100 batch - 1, cap - 0100
  ENTRY_LEVEL_NFT_ID_3 = 10002 // 10002 batch - 1, cap - 0002

function withDecimals(toConvert: number) {
  return toConvert * 10 ** 6
}

describe('User Paths Testing', async () => {
  let paymentTokenContract: CoinTest,
    puzzleContract: SLCore,
    logicsContract: SLLogics,
    factoryContract: Factory,
    accounts: SignerWithAddress[],
    investors: SignerWithAddress[],
    owner: SignerWithAddress,
    investor1: SignerWithAddress,
    investor2: SignerWithAddress,
    investor3: SignerWithAddress,
    investor4: SignerWithAddress,
    investmentContractLevel1: Investment,
    investmentContractLevel2: Investment,
    investmentContractLevel3: Investment

  async function DeployContracts() {
    accounts = await ethers.getSigners()
    owner = accounts[0]
    investor1 = accounts[1]
    investor2 = accounts[2]
    investor3 = accounts[3]
    investor4 = accounts[4]
    investors = [investor1, investor2, investor3, investor4]

    const investmentContractFactory = new Factory__factory(owner),
      paymentTokenFactory = new CoinTest__factory(owner),
      puzzleContractFactory = new SLCore__factory(owner),
      logicsContractFactory = new SLLogics__factory(owner)

    factoryContract = await investmentContractFactory.deploy()
    await factoryContract.deployed()
    paymentTokenContract = await paymentTokenFactory.deploy()
    await paymentTokenContract.deployed()
    logicsContract = await logicsContractFactory.deploy(
      factoryContract.address,
      paymentTokenContract.address,
    )
    await logicsContract.deployed()
    puzzleContract = await puzzleContractFactory.deploy(
      factoryContract.address,
      logicsContract.address,
    )
    await puzzleContract.deployed()

    await factoryContract.setEntryAddress(puzzleContract.address)
    // Allow SLCore to make changes in SLLogics
    await logicsContract.setAllowedContracts(puzzleContract.address, true)
    // Create a new entry batch
    await puzzleContract.generateNewEntryBatch(
      ENTRY_BATCH_CAP_1,
      ENTRY_BATCH_PRICE_1,
      ENTRY_TOKEN_URI,
    )

    // mint and approve payment token for all users
    await paymentTokenContract.connect(investor1).mint(ENTRY_BATCH_PRICE_1)
    await paymentTokenContract
      .connect(investor1)
      .approve(logicsContract.address, withDecimals(ENTRY_BATCH_PRICE_1))
    await paymentTokenContract.connect(investor2).mint(ENTRY_BATCH_PRICE_1)
    await paymentTokenContract
      .connect(investor2)
      .approve(logicsContract.address, withDecimals(ENTRY_BATCH_PRICE_1))

    await paymentTokenContract.connect(investor3).mint(ENTRY_BATCH_PRICE_1)
    await paymentTokenContract
      .connect(investor3)
      .approve(logicsContract.address, withDecimals(ENTRY_BATCH_PRICE_1))

    await paymentTokenContract.connect(investor4).mint(ENTRY_BATCH_PRICE_1)
    await paymentTokenContract
      .connect(investor4)
      .approve(logicsContract.address, withDecimals(ENTRY_BATCH_PRICE_1))

    return {
      factoryContract,
      paymentTokenContract,
      investor1,
      investor2,
      investor3,
      investor4,
      puzzleContract,
      logicsContract,
      investors,
    }
  }

  async function entryNftReadyAndLevel1InvestmentDeployed() {
    const {
      paymentTokenContract,
      investor1,
      investor2,
      investor3,
      investor4,
      puzzleContract,
      logicsContract,
      factoryContract,
    } = await loadFixture(DeployContracts)
    await puzzleContract.connect(investor1).mintEntry()
    await puzzleContract.connect(investor2).mintEntry()
    await puzzleContract.connect(investor3).mintEntry()
    await puzzleContract.connect(investor4).mintEntry()

    const investmentFactory = new Investment__factory(owner)
    await factoryContract.deployNew(
      INVESTMENT_1_AMOUNT,
      paymentTokenContract.address,
      1,
    )
    const investmentAddress = await factoryContract.getLastDeployedContract(1)
    investmentContractLevel1 = investmentFactory.attach(investmentAddress)

    await paymentTokenContract.connect(investor1).mint(INVESTED_LEVEL_1)
    await paymentTokenContract.connect(investor2).mint(INVESTED_LEVEL_1)
    await paymentTokenContract.connect(investor3).mint(INVESTED_LEVEL_1)
    await paymentTokenContract.connect(investor4).mint(INVESTED_LEVEL_1)
    await paymentTokenContract
      .connect(investor1)
      .approve(investmentContractLevel1.address, withDecimals(INVESTED_LEVEL_1))
    await paymentTokenContract
      .connect(investor2)
      .approve(investmentContractLevel1.address, withDecimals(INVESTED_LEVEL_1))
    await paymentTokenContract
      .connect(investor3)
      .approve(investmentContractLevel1.address, withDecimals(INVESTED_LEVEL_1))
    await paymentTokenContract
      .connect(investor4)
      .approve(investmentContractLevel1.address, withDecimals(INVESTED_LEVEL_1))

    return {
      factoryContract,
      paymentTokenContract,
      investor1,
      investor2,
      investor3,
      investor4,
      puzzleContract,
      logicsContract,
      investmentContractLevel1,
    }
  }

  async function userInvestedEnoughToHave10Pieces() {
    const {
      paymentTokenContract,
      investor1,
      investor2,
      investor3,
      investor4,
      puzzleContract,
      logicsContract,
      factoryContract,
    } = await loadFixture(entryNftReadyAndLevel1InvestmentDeployed)
    for (let i = 0; i < 5; i++) {
      const investmentFactory = new Investment__factory(owner)
      await factoryContract.deployNew(
        INVESTMENT_1_AMOUNT,
        paymentTokenContract.address,
        1,
      )
      const investmentAddress = await factoryContract.getLastDeployedContract(1)
      investmentContractLevel1 = investmentFactory.attach(investmentAddress)

      await paymentTokenContract.connect(investor1).mint(INVESTED_LEVEL_1)
      await paymentTokenContract.connect(investor2).mint(INVESTED_LEVEL_1)
      await paymentTokenContract.connect(investor3).mint(INVESTED_LEVEL_1)
      await paymentTokenContract.connect(investor4).mint(INVESTED_LEVEL_1)
      await paymentTokenContract
        .connect(investor1)
        .approve(
          investmentContractLevel1.address,
          withDecimals(INVESTED_LEVEL_1),
        )
      await paymentTokenContract
        .connect(investor2)
        .approve(
          investmentContractLevel1.address,
          withDecimals(INVESTED_LEVEL_1),
        )
      await paymentTokenContract
        .connect(investor3)
        .approve(
          investmentContractLevel1.address,
          withDecimals(INVESTED_LEVEL_1),
        )
      await paymentTokenContract
        .connect(investor4)
        .approve(
          investmentContractLevel1.address,
          withDecimals(INVESTED_LEVEL_1),
        )
      await investmentContractLevel1.connect(investor1).invest(INVESTED_LEVEL_1)
      await investmentContractLevel1.connect(investor2).invest(INVESTED_LEVEL_1)
      await investmentContractLevel1.connect(investor3).invest(INVESTED_LEVEL_1)
      await investmentContractLevel1.connect(investor4).invest(INVESTED_LEVEL_1)
    }

    return {
      investors,
      factoryContract,
      paymentTokenContract,
      investor1,
      investor2,
      investor3,
      investor4,
      puzzleContract,
      logicsContract,
      investmentContractLevel1,
    }
  }

  async function allUsersLevel2() {
    const {
      paymentTokenContract,
      investor1,
      investor2,
      investor3,
      investor4,
      puzzleContract,
      logicsContract,
      factoryContract,
      investmentContractLevel1,
    } = await loadFixture(entryNftReadyAndLevel1InvestmentDeployed)

    await puzzleContract.connect(investor1).mintTest(1)
    await puzzleContract.connect(investor1).claimLevel()
    await puzzleContract.connect(investor2).mintTest(1)
    await puzzleContract.connect(investor2).claimLevel()
    await puzzleContract.connect(investor3).mintTest(1)
    await puzzleContract.connect(investor3).claimLevel()
    await puzzleContract.connect(investor4).mintTest(1)
    await puzzleContract.connect(investor4).claimLevel()

    const investmentFactory = new Investment__factory(owner)
    await factoryContract.deployNew(
      INVESTMENT_2_AMOUNT,
      paymentTokenContract.address,
      2,
    )
    const investmentAddress = await factoryContract.getLastDeployedContract(2)
    investmentContractLevel2 = investmentFactory.attach(investmentAddress)

    await paymentTokenContract
      .connect(investor1)
      .mint(INVESTED_LEVEL_1 + INVESTED_LEVEL_2)
    await paymentTokenContract
      .connect(investor2)
      .mint(INVESTED_LEVEL_1 + INVESTED_LEVEL_2)
    await paymentTokenContract
      .connect(investor3)
      .mint(INVESTED_LEVEL_1 + INVESTED_LEVEL_2)
    await paymentTokenContract
      .connect(investor4)
      .mint(INVESTED_LEVEL_1 + INVESTED_LEVEL_2)
    await paymentTokenContract
      .connect(investor1)
      .approve(investmentContractLevel1.address, withDecimals(INVESTED_LEVEL_1))
    await paymentTokenContract
      .connect(investor2)
      .approve(investmentContractLevel1.address, withDecimals(INVESTED_LEVEL_1))
    await paymentTokenContract
      .connect(investor3)
      .approve(investmentContractLevel1.address, withDecimals(INVESTED_LEVEL_1))
    await paymentTokenContract
      .connect(investor4)
      .approve(investmentContractLevel1.address, withDecimals(INVESTED_LEVEL_1))
    await paymentTokenContract
      .connect(investor1)
      .approve(investmentContractLevel2.address, withDecimals(INVESTED_LEVEL_2))
    await paymentTokenContract
      .connect(investor2)
      .approve(investmentContractLevel2.address, withDecimals(INVESTED_LEVEL_2))
    await paymentTokenContract
      .connect(investor3)
      .approve(investmentContractLevel2.address, withDecimals(INVESTED_LEVEL_2))
    await paymentTokenContract
      .connect(investor4)
      .approve(investmentContractLevel2.address, withDecimals(INVESTED_LEVEL_2))

    return {
      investors,
      factoryContract,
      paymentTokenContract,
      investor1,
      investor2,
      investor3,
      investor4,
      puzzleContract,
      logicsContract,
      investmentContractLevel1,
      investmentContractLevel2,
    }
  }

  async function allUsersLevel2WithLevel1InvestmentTotalOf50k() {
    const {
      paymentTokenContract,
      investor1,
      investor2,
      investor3,
      investor4,
      puzzleContract,
      logicsContract,
      factoryContract,
      investmentContractLevel1,
    } = await loadFixture(userInvestedEnoughToHave10Pieces)

    await puzzleContract.connect(investor1).mintTest(1)
    await puzzleContract.connect(investor1).claimLevel()
    await puzzleContract.connect(investor2).mintTest(1)
    await puzzleContract.connect(investor2).claimLevel()
    await puzzleContract.connect(investor3).mintTest(1)
    await puzzleContract.connect(investor3).claimLevel()
    await puzzleContract.connect(investor4).mintTest(1)
    await puzzleContract.connect(investor4).claimLevel()

    const investmentFactory = new Investment__factory(owner)
    await factoryContract.deployNew(
      INVESTMENT_2_AMOUNT,
      paymentTokenContract.address,
      2,
    )
    const investmentAddress = await factoryContract.getLastDeployedContract(2)
    investmentContractLevel2 = investmentFactory.attach(investmentAddress)

    await paymentTokenContract
      .connect(investor1)
      .mint(INVESTED_LEVEL_1 + INVESTED_LEVEL_2)
    await paymentTokenContract
      .connect(investor2)
      .mint(INVESTED_LEVEL_1 + INVESTED_LEVEL_2)
    await paymentTokenContract
      .connect(investor3)
      .mint(INVESTED_LEVEL_1 + INVESTED_LEVEL_2)
    await paymentTokenContract
      .connect(investor4)
      .mint(INVESTED_LEVEL_1 + INVESTED_LEVEL_2)
    await paymentTokenContract
      .connect(investor1)
      .approve(investmentContractLevel1.address, withDecimals(INVESTED_LEVEL_1))
    await paymentTokenContract
      .connect(investor2)
      .approve(investmentContractLevel1.address, withDecimals(INVESTED_LEVEL_1))
    await paymentTokenContract
      .connect(investor3)
      .approve(investmentContractLevel1.address, withDecimals(INVESTED_LEVEL_1))
    await paymentTokenContract
      .connect(investor4)
      .approve(investmentContractLevel1.address, withDecimals(INVESTED_LEVEL_1))
    await paymentTokenContract
      .connect(investor1)
      .approve(investmentContractLevel2.address, withDecimals(INVESTED_LEVEL_2))
    await paymentTokenContract
      .connect(investor2)
      .approve(investmentContractLevel2.address, withDecimals(INVESTED_LEVEL_2))
    await paymentTokenContract
      .connect(investor3)
      .approve(investmentContractLevel2.address, withDecimals(INVESTED_LEVEL_2))
    await paymentTokenContract
      .connect(investor4)
      .approve(investmentContractLevel2.address, withDecimals(INVESTED_LEVEL_2))

    return {
      investors,
      factoryContract,
      paymentTokenContract,
      investor1,
      investor2,
      investor3,
      investor4,
      puzzleContract,
      logicsContract,
      investmentContractLevel1,
      investmentContractLevel2,
    }
  }

  async function userInvestedEnoughToHave10PiecesInLevel2() {
    const {
      paymentTokenContract,
      investor1,
      investor2,
      investor3,
      investor4,
      puzzleContract,
      logicsContract,
      factoryContract,
    } = await loadFixture(entryNftReadyAndLevel1InvestmentDeployed)

    //all users in level 2
    await puzzleContract.connect(investor1).mintTest(1)
    await puzzleContract.connect(investor1).claimLevel()
    await puzzleContract.connect(investor2).mintTest(1)
    await puzzleContract.connect(investor2).claimLevel()
    await puzzleContract.connect(investor3).mintTest(1)
    await puzzleContract.connect(investor3).claimLevel()
    await puzzleContract.connect(investor4).mintTest(1)
    await puzzleContract.connect(investor4).claimLevel()

    for (let i = 0; i < 5; i++) {
      const investmentFactory = new Investment__factory(owner)
      await factoryContract.deployNew(
        INVESTMENT_2_AMOUNT,
        paymentTokenContract.address,
        2,
      )
      const investmentAddress = await factoryContract.getLastDeployedContract(2)
      investmentContractLevel2 = investmentFactory.attach(investmentAddress)

      await paymentTokenContract.connect(investor1).mint(INVESTED_LEVEL_2)
      await paymentTokenContract.connect(investor2).mint(INVESTED_LEVEL_2)
      await paymentTokenContract.connect(investor3).mint(INVESTED_LEVEL_2)
      await paymentTokenContract.connect(investor4).mint(INVESTED_LEVEL_2)
      await paymentTokenContract
        .connect(investor1)
        .approve(
          investmentContractLevel2.address,
          withDecimals(INVESTED_LEVEL_2),
        )
      await paymentTokenContract
        .connect(investor2)
        .approve(
          investmentContractLevel2.address,
          withDecimals(INVESTED_LEVEL_2),
        )
      await paymentTokenContract
        .connect(investor3)
        .approve(
          investmentContractLevel2.address,
          withDecimals(INVESTED_LEVEL_2),
        )
      await paymentTokenContract
        .connect(investor4)
        .approve(
          investmentContractLevel2.address,
          withDecimals(INVESTED_LEVEL_2),
        )
      await investmentContractLevel2.connect(investor1).invest(INVESTED_LEVEL_2)
      await investmentContractLevel2.connect(investor2).invest(INVESTED_LEVEL_2)
      await investmentContractLevel2.connect(investor3).invest(INVESTED_LEVEL_2)
      await investmentContractLevel2.connect(investor4).invest(INVESTED_LEVEL_2)
    }

    return {
      investors,
      factoryContract,
      paymentTokenContract,
      investor1,
      investor2,
      investor3,
      investor4,
      puzzleContract,
      logicsContract,
      investmentContractLevel1,
    }
  }

  async function allUsersLevel3() {
    const {
      paymentTokenContract,
      investor1,
      investor2,
      investor3,
      investor4,
      puzzleContract,
      logicsContract,
      factoryContract,
      investmentContractLevel1,
      investmentContractLevel2,
    } = await loadFixture(allUsersLevel2)

    await puzzleContract.connect(investor1).mintTest(2)
    await puzzleContract.connect(investor1).claimLevel()
    await puzzleContract.connect(investor2).mintTest(2)
    await puzzleContract.connect(investor2).claimLevel()
    await puzzleContract.connect(investor3).mintTest(2)
    await puzzleContract.connect(investor3).claimLevel()
    await puzzleContract.connect(investor4).mintTest(2)
    await puzzleContract.connect(investor4).claimLevel()

    const investmentFactory = new Investment__factory(owner)
    await factoryContract.deployNew(
      INVESTMENT_3_AMOUNT,
      paymentTokenContract.address,
      3,
    )
    const investmentAddress = await factoryContract.getLastDeployedContract(3)
    investmentContractLevel3 = investmentFactory.attach(investmentAddress)

    await paymentTokenContract.connect(investor1).mint(INVESTED_LEVEL_3)
    await paymentTokenContract.connect(investor2).mint(INVESTED_LEVEL_3)
    await paymentTokenContract.connect(investor3).mint(INVESTED_LEVEL_3)
    await paymentTokenContract.connect(investor4).mint(INVESTED_LEVEL_3)
    await paymentTokenContract
      .connect(investor1)
      .approve(investmentContractLevel3.address, withDecimals(INVESTED_LEVEL_3))
    await paymentTokenContract
      .connect(investor2)
      .approve(investmentContractLevel3.address, withDecimals(INVESTED_LEVEL_3))
    await paymentTokenContract
      .connect(investor3)
      .approve(investmentContractLevel3.address, withDecimals(INVESTED_LEVEL_3))
    await paymentTokenContract
      .connect(investor4)
      .approve(investmentContractLevel3.address, withDecimals(INVESTED_LEVEL_3))

    return {
      investors,
      factoryContract,
      paymentTokenContract,
      investor1,
      investor2,
      investor3,
      investor4,
      puzzleContract,
      logicsContract,
      investmentContractLevel1,
      investmentContractLevel2,
      investmentContractLevel3,
    }
  }

  describe('Full user progression and investing (4 users)', async () => {
    it('Should allow all users to mint the entry batch after approval', async () => {
      const {
        paymentTokenContract,
        investor1,
        investor2,
        investor3,
        investor4,
        puzzleContract,
        logicsContract,
      } = await loadFixture(DeployContracts)
      await expect(await puzzleContract.connect(investor1).mintEntry())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor1.address, ENTRY_LEVEL_NFT_ID_1, 1)
      await expect(await puzzleContract.connect(investor2).mintEntry())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor2.address, ENTRY_LEVEL_NFT_ID_1, 1)
      await expect(await puzzleContract.connect(investor3).mintEntry())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor3.address, ENTRY_LEVEL_NFT_ID_1, 1)
      await expect(await puzzleContract.connect(investor4).mintEntry())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor4.address, ENTRY_LEVEL_NFT_ID_1, 1)
    })

    it('Should allow all users to invest in Investment Level1Contracts', async () => {
      const {
        paymentTokenContract,
        investor1,
        investor2,
        investor3,
        investor4,
        puzzleContract,
        logicsContract,
        investmentContractLevel1,
      } = await loadFixture(entryNftReadyAndLevel1InvestmentDeployed)
      await expect(
        await investmentContractLevel1
          .connect(investor1)
          .invest(INVESTED_LEVEL_1),
      )
        .to.emit(investmentContractLevel1, 'UserInvest')
        .withArgs(investor1.address, INVESTED_LEVEL_1, anyValue)
      await expect(
        await investmentContractLevel1
          .connect(investor2)
          .invest(INVESTED_LEVEL_1),
      )
        .to.emit(investmentContractLevel1, 'UserInvest')
        .withArgs(investor2.address, INVESTED_LEVEL_1, anyValue)
      await expect(
        await investmentContractLevel1
          .connect(investor3)
          .invest(INVESTED_LEVEL_1),
      )
        .to.emit(investmentContractLevel1, 'UserInvest')
        .withArgs(investor3.address, INVESTED_LEVEL_1, anyValue)
      await expect(
        await investmentContractLevel1
          .connect(investor4)
          .invest(INVESTED_LEVEL_1),
      )
        .to.emit(investmentContractLevel1, 'UserInvest')
        .withArgs(investor4.address, INVESTED_LEVEL_1, anyValue)
    })

    it('In level1, Should be able to mint 10 pieces  and mint next level (if thats not enough to have the random pieces, we call mint test)', async () => {
      const {
        paymentTokenContract,
        investor1,
        investor2,
        investor3,
        investor4,
        puzzleContract,
        logicsContract,
        investmentContractLevel1,
        investors,
      } = await loadFixture(userInvestedEnoughToHave10Pieces)
      for (let i = 0; i < 10; i++) {
        await puzzleContract.connect(investor1).claimPiece()
        await puzzleContract.connect(investor2).claimPiece()
        await puzzleContract.connect(investor3).claimPiece()
        await puzzleContract.connect(investor4).claimPiece()
      }

      await puzzleContract.connect(investor1).mintTest(1)
      await expect(await puzzleContract.connect(investor1).claimLevel())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor1.address, 30, 1)
      await puzzleContract.connect(investor2).mintTest(1)
      await expect(await puzzleContract.connect(investor2).claimLevel())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor2.address, 30, 1)
      await puzzleContract.connect(investor3).mintTest(1)
      await expect(await puzzleContract.connect(investor3).claimLevel())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor3.address, 30, 1)
      await puzzleContract.connect(investor4).mintTest(1)
      await expect(await puzzleContract.connect(investor4).claimLevel())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor4.address, 30, 1)
    })

    it('Should allow all users in Level 2 to invest in Investment Level2Contracts while still able to invest in Level1Contracts', async () => {
      const {
        paymentTokenContract,
        investor1,
        investor2,
        investor3,
        investor4,
        puzzleContract,
        logicsContract,
        investmentContractLevel1,
        investmentContractLevel2,
      } = await loadFixture(allUsersLevel2)

      //Still able to do level 1
      await investmentContractLevel1.connect(investor1).invest(INVESTED_LEVEL_1)
      expect(await investmentContractLevel1.balanceOf(investor1.address)).to.eq(
        withDecimals(INVESTED_LEVEL_1),
      )
      await investmentContractLevel1.connect(investor2).invest(INVESTED_LEVEL_1)
      expect(await investmentContractLevel1.balanceOf(investor2.address)).to.eq(
        withDecimals(INVESTED_LEVEL_1),
      )
      await investmentContractLevel1.connect(investor3).invest(INVESTED_LEVEL_1)
      expect(await investmentContractLevel1.balanceOf(investor3.address)).to.eq(
        withDecimals(INVESTED_LEVEL_1),
      )
      await investmentContractLevel1.connect(investor4).invest(INVESTED_LEVEL_1)
      expect(await investmentContractLevel1.balanceOf(investor4.address)).to.eq(
        withDecimals(INVESTED_LEVEL_1),
      )

      //Level 2
      await investmentContractLevel2.connect(investor1).invest(INVESTED_LEVEL_2)
      expect(await investmentContractLevel2.balanceOf(investor1.address)).to.eq(
        withDecimals(INVESTED_LEVEL_2),
      )
      await investmentContractLevel2.connect(investor2).invest(INVESTED_LEVEL_2)
      expect(await investmentContractLevel2.balanceOf(investor2.address)).to.eq(
        withDecimals(INVESTED_LEVEL_2),
      )
      await investmentContractLevel2.connect(investor3).invest(INVESTED_LEVEL_2)
      expect(await investmentContractLevel2.balanceOf(investor3.address)).to.eq(
        withDecimals(INVESTED_LEVEL_2),
      )
      await investmentContractLevel2.connect(investor4).invest(INVESTED_LEVEL_2)
      expect(await investmentContractLevel2.balanceOf(investor4.address)).to.eq(
        withDecimals(INVESTED_LEVEL_2),
      )
    })

    it('As a user in Level2, Ill try to invest in level 1 contracts to claim LVl2 pieces(this is not allowed)', async () => {
      const {
        paymentTokenContract,
        investor1,
        investor2,
        investor3,
        investor4,
        puzzleContract,
        logicsContract,
        investmentContractLevel1,
        investmentContractLevel2,
      } = await loadFixture(allUsersLevel2WithLevel1InvestmentTotalOf50k)

      //trying to claim piece while not investing i n level 2
      await expect(
        puzzleContract.connect(investor1).claimPiece(),
      ).to.be.revertedWith(
        'SLLogics: User does not have enough investment to claim this piece',
      )
      await expect(
        puzzleContract.connect(investor2).claimPiece(),
      ).to.be.revertedWith(
        'SLLogics: User does not have enough investment to claim this piece',
      )
      await expect(
        puzzleContract.connect(investor3).claimPiece(),
      ).to.be.revertedWith(
        'SLLogics: User does not have enough investment to claim this piece',
      )
      await expect(
        puzzleContract.connect(investor4).claimPiece(),
      ).to.be.revertedWith(
        'SLLogics: User does not have enough investment to claim this piece',
      )
    })

    it('In level2, Should be able to mint 10 pieces  and mint next level (if thats not enough to have the random pieces, we call mint test)', async () => {
      const {
        paymentTokenContract,
        investor1,
        investor2,
        investor3,
        investor4,
        puzzleContract,
        logicsContract,
        investmentContractLevel1,
        investors,
      } = await loadFixture(userInvestedEnoughToHave10PiecesInLevel2)
      for (let i = 0; i < 10; i++) {
        await puzzleContract.connect(investor1).claimPiece()
        await puzzleContract.connect(investor2).claimPiece()
        await puzzleContract.connect(investor3).claimPiece()
        await puzzleContract.connect(investor4).claimPiece()
      }

      await puzzleContract.connect(investor1).mintTest(2)
      await expect(await puzzleContract.connect(investor1).claimLevel())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor1.address, 31, 1)
      await puzzleContract.connect(investor2).mintTest(2)
      await expect(await puzzleContract.connect(investor2).claimLevel())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor2.address, 31, 1)
      await puzzleContract.connect(investor3).mintTest(2)
      await expect(await puzzleContract.connect(investor3).claimLevel())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor3.address, 31, 1)
      await puzzleContract.connect(investor4).mintTest(2)
      await expect(await puzzleContract.connect(investor4).claimLevel())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor4.address, 31, 1)
    })

    it('Should allow all users in Level 3 to invest in Investment Level2Contracts while still able to invest in Level2 and Level1 Contracts', async () => {
      const {
        paymentTokenContract,
        investor1,
        investor2,
        investor3,
        investor4,
        puzzleContract,
        logicsContract,
        investmentContractLevel1,
        investmentContractLevel2,
        investmentContractLevel3,
      } = await loadFixture(allUsersLevel3)

      //Still able to do level 1
      await investmentContractLevel1.connect(investor1).invest(INVESTED_LEVEL_1)
      expect(await investmentContractLevel1.balanceOf(investor1.address)).to.eq(
        withDecimals(INVESTED_LEVEL_1),
      )
      await investmentContractLevel1.connect(investor2).invest(INVESTED_LEVEL_1)
      expect(await investmentContractLevel1.balanceOf(investor2.address)).to.eq(
        withDecimals(INVESTED_LEVEL_1),
      )
      await investmentContractLevel1.connect(investor3).invest(INVESTED_LEVEL_1)
      expect(await investmentContractLevel1.balanceOf(investor3.address)).to.eq(
        withDecimals(INVESTED_LEVEL_1),
      )
      await investmentContractLevel1.connect(investor4).invest(INVESTED_LEVEL_1)
      expect(await investmentContractLevel1.balanceOf(investor4.address)).to.eq(
        withDecimals(INVESTED_LEVEL_1),
      )

      // still able Level 2
      await investmentContractLevel2.connect(investor1).invest(INVESTED_LEVEL_2)
      expect(await investmentContractLevel2.balanceOf(investor1.address)).to.eq(
        withDecimals(INVESTED_LEVEL_2),
      )
      await investmentContractLevel2.connect(investor2).invest(INVESTED_LEVEL_2)
      expect(await investmentContractLevel2.balanceOf(investor2.address)).to.eq(
        withDecimals(INVESTED_LEVEL_2),
      )
      await investmentContractLevel2.connect(investor3).invest(INVESTED_LEVEL_2)
      expect(await investmentContractLevel2.balanceOf(investor3.address)).to.eq(
        withDecimals(INVESTED_LEVEL_2),
      )
      await investmentContractLevel2.connect(investor4).invest(INVESTED_LEVEL_2)
      expect(await investmentContractLevel2.balanceOf(investor4.address)).to.eq(
        withDecimals(INVESTED_LEVEL_2),
      )

      // able in level 3
      await investmentContractLevel3.connect(investor1).invest(INVESTED_LEVEL_3)
      expect(await investmentContractLevel3.balanceOf(investor1.address)).to.eq(
        withDecimals(INVESTED_LEVEL_3),
      )
      await investmentContractLevel3.connect(investor2).invest(INVESTED_LEVEL_3)
      expect(await investmentContractLevel3.balanceOf(investor2.address)).to.eq(
        withDecimals(INVESTED_LEVEL_3),
      )
      await investmentContractLevel3.connect(investor3).invest(INVESTED_LEVEL_3)
      expect(await investmentContractLevel3.balanceOf(investor3.address)).to.eq(
        withDecimals(INVESTED_LEVEL_3),
      )
      await investmentContractLevel3.connect(investor4).invest(INVESTED_LEVEL_3)
      expect(await investmentContractLevel3.balanceOf(investor4.address)).to.eq(
        withDecimals(INVESTED_LEVEL_3),
      )
    })

    it('User in level 3 should not be allowed to claimLevel()', async () => {
      const {
        paymentTokenContract,
        investor1,
        investor2,
        investor3,
        investor4,
        puzzleContract,
        logicsContract,
        investmentContractLevel1,
        investmentContractLevel2,
        investmentContractLevel3,
      } = await loadFixture(allUsersLevel3)

      await expect(
        puzzleContract.connect(investor1).claimLevel(),
      ).to.be.revertedWith('SLCore: User at Top Level')
      await expect(
        puzzleContract.connect(investor2).claimLevel(),
      ).to.be.revertedWith('SLCore: User at Top Level')
      await expect(
        puzzleContract.connect(investor3).claimLevel(),
      ).to.be.revertedWith('SLCore: User at Top Level')
      await expect(
        puzzleContract.connect(investor4).claimLevel(),
      ).to.be.revertedWith('SLCore: User at Top Level')
    })
  })
  describe('As admin I want to be able to constantly update the platform', async () => {
    it('Create 2 different entry batchs for the 4 users', async () => {
      const {
        paymentTokenContract,
        investor1,
        investor2,
        investor3,
        investor4,
        puzzleContract,
        logicsContract,
      } = await loadFixture(DeployContracts)
      await expect(await puzzleContract.connect(investor1).mintEntry())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor1.address, ENTRY_LEVEL_NFT_ID_1, 1)
      await expect(await puzzleContract.connect(investor2).mintEntry())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor2.address, ENTRY_LEVEL_NFT_ID_1, 1)

      await puzzleContract.generateNewEntryBatch(
        ENTRY_BATCH_CAP_2,
        ENTRY_BATCH_PRICE_2,
        '',
      )

      await expect(await puzzleContract.connect(investor3).mintEntry())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor3.address, ENTRY_LEVEL_NFT_ID_2, 1)
      await expect(await puzzleContract.connect(investor4).mintEntry())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor4.address, ENTRY_LEVEL_NFT_ID_2, 1)
    })
    it('Create a entry batch for only 2 users', async () => {
      const {
        paymentTokenContract,
        investor1,
        investor2,
        investor3,
        investor4,
        puzzleContract,
        logicsContract,
      } = await loadFixture(DeployContracts)
      await puzzleContract.generateNewEntryBatch(
        ENTRY_BATCH_CAP_3,
        ENTRY_BATCH_PRICE_2,
        '',
      )

      await expect(await puzzleContract.connect(investor3).mintEntry())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor3.address, ENTRY_LEVEL_NFT_ID_3, 1)
      await expect(await puzzleContract.connect(investor4).mintEntry())
        .to.emit(puzzleContract, 'TokensClaimed')
        .withArgs(investor4.address, ENTRY_LEVEL_NFT_ID_3, 1)
      await expect(
        puzzleContract.connect(investor1).mintEntry(),
      ).to.be.revertedWith('SLLevels: No entry tokens available')
    })

    it('Create a 10 entry batches', async () => {
      const {
        paymentTokenContract,
        investor1,
        investor2,
        investor3,
        investor4,
        puzzleContract,
        logicsContract,
      } = await loadFixture(DeployContracts)
      await puzzleContract.generateNewEntryBatch(
        ENTRY_BATCH_CAP_3,
        ENTRY_BATCH_PRICE_2,
        '',
      )

     for(let i = 0; i < 10; i++) {
      expect(await puzzleContract.generateNewEntryBatch(
        ENTRY_BATCH_CAP_3,
        ENTRY_BATCH_PRICE_2,
        '',
      )).to.not.be.reverted;
     }

    })



    it('Deploy 10 contracts of each level', async () => {
      const {
        paymentTokenContract,
        investor1,
        investor2,
        investor3,
        investor4,
        puzzleContract,
        logicsContract,
      } = await loadFixture(entryNftReadyAndLevel1InvestmentDeployed)
      const investmentFactory = new Investment__factory(owner)
      for (let i = 0; i < 10; i++) {
        await expect(await factoryContract.deployNew(
          INVESTMENT_1_AMOUNT,
          paymentTokenContract.address,
          1,
        )).to
        .emit(factoryContract , "ContractCreated")
        .withArgs(anyValue, anyValue, 1)
        
        await expect(await factoryContract.deployNew(
          INVESTMENT_2_AMOUNT,
          paymentTokenContract.address,
          2,
        )).to
        .emit(factoryContract , "ContractCreated")
        .withArgs(anyValue, anyValue, 2)
        
        await expect(await factoryContract.deployNew(
          INVESTMENT_3_AMOUNT,
          paymentTokenContract.address,
          3,
        )).to
        .emit(factoryContract , "ContractCreated")
        .withArgs(anyValue, anyValue, 3)
      }
    })
  })
})
