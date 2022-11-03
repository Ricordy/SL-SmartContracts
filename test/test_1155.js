const { expect } = require('chai')

const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')


    /** 
     * Tests for 1155 version of the puzzle 
     * 
     * 
    */
   
    describe('Tests for 1155', function()  {

        /**
         * Deploys contract and gets wallets 
         * @returns constants to use the tests and wallets to interact with the contract
         */

        async function deployContract(){
            const fac = await ethers.getContractFactory("Puzzle")
            const [owner, addr1, addr2] = await ethers.getSigners()
            const PuzzleContract = await fac.deploy();

            await PuzzleContract.deployed()

            return {owner, addr1, addr2, fac, PuzzleContract}


        }

        /**
         * Tests for all functions
         * 
         * Done: 
         */

        describe('Tests on functions', function() {

            /**
             * If the contracts owner is rightly set
            */
            it('Should set the right owner', async () => {
                const { PuzzleContract, owner } = await loadFixture(deployContract)
                expect(await PuzzleContract.owner()).to.equal(owner.address)

            })
            /**
             * If the owner has the ability to mint
             */
            it('Be able to mint 10 tokens to the owner', async () => {
                const {owner, PuzzleContract} = await loadFixture(deployContract)

                expect(await PuzzleContract.balanceOf(owner.address, 0)).to.equal(1)

            })

            it('Owner should be able to mint', async () => {
                const {owner, PuzzleContract} = await loadFixture(deployContract)
                expect(await PuzzleContract.mint()).to.emit(2)

            })

            it('user should be able to mint', async () => {
                const {owner,addr1 ,PuzzleContract} = await loadFixture(deployContract)
                expect(await PuzzleContract.connect(addr1).mint()).to.emit(2)

            })

            it('Owner should be able to claim', async () => {
                const {owner, PuzzleContract} = await loadFixture(deployContract)
                expect(await PuzzleContract.verifyBurn(owner.address)).to.emit(true)

            })
            it('Owner should be able to burn', async () => {
                const {owner, PuzzleContract} = await loadFixture(deployContract)
                expect(await PuzzleContract.burn()).to.emit(true)
            })
            it('User should be able to claim', async () => {
                const {owner, addr1 ,PuzzleContract} = await loadFixture(deployContract)
                await PuzzleContract.connect(addr1).mintTest()
                expect(await PuzzleContract.verifyBurn(addr1.address)).to.emit(true)
            })
            it('User should be able to burn', async () => {
                const {owner, addr1 ,PuzzleContract} = await loadFixture(deployContract)
                await PuzzleContract.connect(addr1).mintTest()
                expect(await PuzzleContract.connect(addr1).burn()).to.emit(true)
            })
            it('User should be able to claim having 11+ tokens', async () => {
                const {owner, addr1 ,PuzzleContract} = await loadFixture(deployContract)
                await PuzzleContract.connect(addr1).mint()
                await PuzzleContract.connect(addr1).mintTest()
                expect(await PuzzleContract.verifyBurn(addr1.address)).to.emit(true)
            })
            it('User should be able to burn having 11+ tokens', async () => {
                const {owner, addr1 ,PuzzleContract} = await loadFixture(deployContract)
                await PuzzleContract.connect(addr1).mint()
                await PuzzleContract.connect(addr1).mintTest()
                expect(await PuzzleContract.connect(addr1).burn()).to.emit(true)
            })
            it('Get the right metadata', async () => {
                const {owner, addr1 ,PuzzleContract} = await loadFixture(deployContract)
                expect(await PuzzleContract.tokenURI(1)).to.equal("ipfs://bafybeidtqcijajia3af4evji3tnax5kwsqjcp2pejhmm52a4kfagtcpze4/1.json")
            })





        })

})