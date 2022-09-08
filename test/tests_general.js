const { expect } = require('chai')

const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')
    //Testes gerais de contrato
    //Testa: deployment e transactions
describe('NFT LegendaryEntry', function() {
    /**
     * Fixtures to ensure contract deployment and
     * some info not needing to execute everytime
     * @returns needed info to run tests
     */

    async function deployTokenFixture() {
        const Puzzle = await ethers.getContractFactory('NFTPuzzle')
        const Level2 = await ethers.getContractFactory('Level2Legendary')
        const [owner, addr1, addr2] = await ethers.getSigners()
        const PuzzleUse = await Puzzle.deploy("ipfs://bafkreidiopk3fpkkbwce5qaof5dfosit7k57jubwav5ttysjdc2ljcfkeq",
            "0x6168499c0cffcacd319c818142124b7a15e857ab")
        const Level2Use = await Level2.deploy("1000",
            "1",
            "50",
            "ipfs://bafkreigjj73bspq5l7kgcsfgzlateiaj45jmbhl5ri4didhqicdnislx34",
            PuzzleUse.address)


        return { Puzzle, Level2, PuzzleUse, Level2Use, owner, addr1, addr2 }
    }

    /**
     * Tests on deployment
     */
    describe('Deployment', function() {
        /**
         * If the contracts owner is rightly set
         */
        it('Should set the right owner', async function() {
            const { PuzzleUse, Level2Use, owner } = await loadFixture(deployTokenFixture)

            expect(await PuzzleUse.owner()).to.equal(owner.address)
            expect(await Level2Use.owner()).to.equal(owner.address)
        })

        /**
         * If the total supply is sendable to owner
         * tests total and some amount
         */
        it('Should be able to min 10 tokens to address1', async function() {
            const { PuzzleUse, Level2Use, addr1 } = await loadFixture(deployTokenFixture)
            await PuzzleUse.connect(addr1).mintForAll(
                10, {
                    value: ethers.utils.parseEther('0')
                });
            const addrBalance = await PuzzleUse.balanceOf(addr1.address)
                //console.log(addrBalance)
            expect(addrBalance).to.equal(10)
        })

        it('Should be able to getBalance == 10', async function() {
            const { PuzzleUse, Level2Use, addr1 } = await loadFixture(deployTokenFixture)
            await PuzzleUse.connect(addr1).mintForAll(
                10, {
                    value: ethers.utils.parseEther('0')
                });
            //const addrBalance = await PuzzleUse.balanceOf(addr1.address)
            //console.log(addrBalance)
            expect(await PuzzleUse.getBalnceUser(addr1.address, 10)).to.emit(10)
        })

    })




    /**
     * Tests on communication
     */
    describe('Get user total amount from level 2 contract', function() {
        /**
         * If the contracts owner is rightly set
         */
        it('Should get user amount from lvl2 contract', async function() {
            const { PuzzleUse, Level2Use, addr1 } = await loadFixture(deployTokenFixture)
            await PuzzleUse.connect(addr1).mintForAll(
                10, {
                    value: ethers.utils.parseEther('0')
                });
            await PuzzleUse.addContractToWhitelist(Level2Use.address)




            expect(await Level2Use.getUserAmount(addr1.address)).to.emit(10)
            expect(await PuzzleUse).to.emit(10)
        })




    })

    /**
     * Tests on transactions
     * Verifies identity and ensures confiability
     *
     */
    /*

                    describe('Transactions', function() {
                        it('Should set NFT buyable and unbuyable', async function() {
                            const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
                                    deployTokenFixture,
                                )
                                // Allow buying
                            await expect(hardhatToken.allowBuy(1, 1))
                                .to.emit(hardhatToken, 'NftBuyable')
                                .withArgs(1, 1)

                            //Disallow buying
                            await expect(hardhatToken.disallowBuy(1))
                                .to.emit(hardhatToken, 'NftNotBuyable')
                                .withArgs(1, 0)

                    })
    */
    /**
     * Transfer test
     *
     *
     */


    /*

                            it('should emit Transfer events', async function() {
                                const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
                                    deployTokenFixture,
                                )

                                hardhatToken.allowBuy(1, 1)
                                    // Transfer token with id 1
                                await expect(
                                        hardhatToken
                                        .connect(addr1)
                                        .buy(1, { value: ethers.utils.parseEther('2') }),
                                    )
                                    .to.emit(hardhatToken, 'NftBought')
                                    .withArgs(hardhatToken.owner, addr1.address, ethers.utils.parseEther('2'))

                                // Transfer token with id 1 again
                                // We use .connect(signer) to send a transaction from another account
                                hardhatToken.connect(addr1).allowBuy(1, 1)
                                await expect(
                                        hardhatToken
                                        .connect(addr2)
                                        .buy(1, { value: ethers.utils.parseEther('2') }),
                                    )
                                    .to.emit(hardhatToken, 'NftBought')
                                    .withArgs(addr1.address, addr2.address, ethers.utils.parseEther('2'))
                            })


                            it('Should not allow to buy an NFT with price 0', async function() {
                                const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
                                    deployTokenFixture,
                                )


                                hardhatToken.disallowBuy(1)
                                await expect(
                                        hardhatToken
                                        .connect(addr2)
                                        .buy(1, { value: ethers.utils.parseEther('2') }))
                                    .to.be.rejectedWith('Token not for sale')

                            })

                            it('Should not allow to underpay an NFT', async function() {
                                const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
                                    deployTokenFixture,
                                )

                                hardhatToken.allowBuy(1, 3)

                                await expect(
                                    hardhatToken
                                    .connect(addr2)
                                    .buy(1, { value: ethers.utils.parseEther('0.1') }),
                                ).to.be.rejectedWith('Incorrect value')
                            })

                            it('Should not safeTranferFrom (owner, addr1, id', async function() {
                                const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
                                    deployTokenFixture,
                                )
                                hardhatToken.transferFrom(owner, addr1, 1)
                                await expect(hardhatToken.ownerOf(1)).to.not.be.equal(addr1)

                            })

                        })
    */

    /**
     * Test all functions related to URI 
     * 
     * 
     */

    /*
            describe('URI ', async function() {
                it(' Should be able to change and see URI ', async function() {

                    const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
                        deployTokenFixture,
                    )

                    hardhatToken.setUri('www.coco.com/img')
                    await expect(await hardhatToken.getUri())
                        .to.equal('www.coco.com/img')
                })



                it('Should have the same URI for all tokens ', async function() {
                    const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
                        deployTokenFixture,

                    )

                    for (let i = 0; i < hardhatToken.currentId(); i++) {
                        await expect(await hardhatToken.tokenURI(i)).to.equal(await hardhatToken.tokenURI(i + 1))
                    }

                })
            })
    */

    /**
     * Test all functions with onlyOnwer permission
     * 
     * 
     */

    describe('Ownership', function() {


        it('Should not let addr1 set mint open', async function() {
            const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
                deployTokenFixture,
            )

            hardhatToken.connect(addr1).setMintable()
            await expect(hardhatToken.mintOpen).to.not.equal(true);


        })

        it('Should not let addr1 set mint closed', async function() {
            const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
                deployTokenFixture,
            )

            hardhatToken.setMintable(true)
            hardhatToken.connect(addr1).setUnmintable()
            await expect(hardhatToken.mintOpen).to.not.equal(false);


        })

    })

    /*
        describe('Methods and fucntions', function() {
            it('Should not let addr1 set mint open', async function() {
                const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
                    deployTokenFixture,
                )
                hardhatToken.connect(addr1).setMintable()
                await expect(hardhatToken.mintOpen).to.not.equal(true);
            })
            it('Should not let addr1 set mint closed', async function() {
                const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
                    deployTokenFixture,
                )
                hardhatToken.setMintable(true)
                hardhatToken.connect(addr1).setUnmintable()
                await expect(hardhatToken.mintOpen).to.not.equal(false);
            })
        })
        */

})