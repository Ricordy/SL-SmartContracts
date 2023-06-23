# Solidity Investment Project

This project is a Solidity-based investment platform that uses NFTs to represent investment levels. Each level consists of 10 NFT pieces, and upon completion, you can claim the next level. Investments are generated through a factory that stores users' investment values for piece claiming purposes.

## Getting Started

Before you start, make sure you have Node.js and Yarn installed on your machine. If not, you can download them from [NodeJS](https://nodejs.org/en/download/) and [Yarn](https://yarnpkg.com/getting-started/install).

### Install Dependencies

First, install the project dependencies by running:

```bash
yarn install
```

### Start the Blockchain

To start the local Hardhat blockchain, use the following command:

```bash
yarn bc
```

### Compile and Deploy the Contract

Before deploying the contract, you need to compile it. Run the following command to clean the cache and compile the contract:

```bash
yarn compile
```

After compiling the contract, you can deploy it to the local Hardhat network using:

```bash
yarn deploy
```

### Mint Entry NFT

To mint the entry-level NFT, run:

```bash
yarn mint
```

## Interacting with the Project

### Mint Puzzle Pieces

To mint puzzle pieces for level 1, use:

```bash
yarn mintPuzzle
```

To mint puzzle pieces for level 2, use:

```bash
yarn mintPuzzlel2
```

### Investment Commands

To invest in the project, use the following commands based on the amount and level you want to invest in:

- Invest 5000 at Level 1:

```bash
yarn invest5kl1
```

- Invest 10000 at Level 2:

```bash
yarn invest10kl2
```

- Invest 15000 at Level 3:

```bash
yarn invest15kl3
```

### Deploy Investment Contract

To deploy the investment contract, use:

```bash
yarn deployInvest
```
