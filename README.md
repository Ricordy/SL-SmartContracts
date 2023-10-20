<!-- TOC --><a name="something-legendary-smart-contracts"></a>
# **Something Legendary Smart Contracts**

<!-- TOC --><a name="introduction-"></a>
## **Introduction 🎬**

Something Legendary is an investment platform for the purchase, renovation and subsequent sale of classic cars, usingWeb 3.0 tools as a method of financial ease of use and as a gamification element.

<!-- TOC --><a name="table-of-content-"></a>
## **Table of content 📖**

<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [**Something Legendary Smart Contracts**](#something-legendary-smart-contracts)
   * [**Introduction 🎬**](#introduction-)
   * [**Table of content 📖**](#table-of-content-)
   * [**Something Legendary Platform 🚘**](#something-legendary-platform-)
   * [Functional Requirements ⚙️](#functional-requirements-)
      + [Roles 💂](#roles-)
      + [Features 🕊](#features-)
      + [Use cases ⛹️‍♀️](#use-cases-)
   * [Technical requirements 😮‍💨](#technical-requirements-)
      + [Quick overview 👀](#quick-overview-)
      + [Architecture Overview 🏛](#architecture-overview-)
      + [Dependencies 🦿](#dependencies-)
      + [Contract Information ℹ️](#contract-information-)
   * [Getting started 🚀](#getting-started-)
      + [**Prerequisites 💺**](#prerequisites-)
      + [**Clone the Repository ㊢**](#clone-the-repository-)
      + [**Install Dependencies 🧑‍🔧**](#install-dependencies-)
      + [Update the .env file 🚑](#update-the-env-file-)
      + [**Run the Project 🔥**](#run-the-project-)
   * [Smart Contract Scripts 💻](#smart-contract-scripts-)
      + [Deploy Smart Contract (Localhost) 🚓](#deploy-smart-contract-localhost-)
      + [Deploy Smart Contract (Mumbai Testnet)  🚲](#deploy-smart-contract-mumbai-testnet-)
      + [Mint Tokens (Localhost) 🥺](#mint-tokens-localhost-)
      + [Mint Payment Token (Localhost) 💰](#mint-payment-token-localhost-)
      + [Mint Puzzle Token (Localhost) 🧩](#mint-puzzle-token-localhost-)
      + [Mint Puzzle Token Level 2 (Localhost) 🧩](#mint-puzzle-token-level-2-localhost-)
      + [Invest (Localhost) 🤑](#invest-localhost-)
      + [Invest 5k with Level 1 Contract (Localhost) 🤑💰](#invest-5k-with-level-1-contract-localhost-)
      + [Invest 10k with Level 2 Access (Localhost)💰💰](#invest-10k-with-level-2-access-localhost)
      + [Invest 15k with Level 3 Access (Localhost)💰🤑💰](#invest-15k-with-level-3-access-localhost)
      + [Deploy Investment Contract (Localhost) 🕊](#deploy-investment-contract-localhost-)
      + [Compile Contracts 📚](#compile-contracts-)
      + [Start Local Hardhat Node 🕸](#start-local-hardhat-node-)

<!-- TOC end -->
<!-- TOC --><a name="something-legendary-platform-"></a>
## **Something Legendary Platform 🚘**

Something Legendary offers an innovative approach to classic car investment. Here are some key aspects of the platform:

- **Membership Cards:** To start investing in Something Legendary, users need to acquire a Membership Card. The platform has three levels, and after obtaining a Membership Card, users start at level 1.
- **Investment Tiers:** As users progress through the levels, more cars become available for investment, each with different return rates. Every investment has a total value, an estimated end date (which can be extended in certain cases), an estimated claim/refill date, and a status indicating the investment's phase. After the refill, the investment contract will be set a return rate and the users will be allowed to withdraw their investment with the profit made.
- **Gamification:** Levels 2 and 3 are achieved by collecting NFT puzzle pieces. These pieces are randomly minted, and when 10 distinct ones are collected, the user will be able to claim the next level, adding a gamification aspect to the platform. Users can also use trades and secondary markets to enhance their experience.

<!-- TOC --><a name="functional-requirements-"></a>
## Functional Requirements ⚙️

<!-- TOC --><a name="roles-"></a>
### Roles 💂

Something Legendary has 3 main roles, and an “abstract” one. The abstract role is assigned to certain smartcontracts of our schema, that need to be able to change values in other contracts.

- CEO - The CEO can reassign other roles and change the addresses of our dependent smartcontracts. It is also the only role that can unpause the platform or any specific contract. It is initially set to the address that deployed the smart contract, in the contract constructor.
- CFO - The CFO is the role that manages all funds in the platform. It is responsible for withdrawing the entry fees, also withdraws the funds from all investment contracts as well as the subsequent refill of the contracts.
- User - The user can mint a Membership card. Without the Membership card, the user will not be allowed to do anything else
- Membership carded user - A user with a Membership card. This user is able to interact with every level 1 investment. By progressing each level, the user is able to invest in same level cars, without losing the ability to invest in lower levels.
- Allowed contracts (abstract actor) - This actor is responsible for management of funds in SLLogics contract. This role is given to SLCore in order to deal with the payments (the funds are stored in SLLogics), as well as updating the Membership card price when a new batch is released.

<!-- TOC --><a name="features-"></a>
### Features 🕊

Something Legendary has the following features:

- Deploy a new investment contract (CEO)
- Get user investment in all platform/per level/per contract (ALL)
- Get total invested in the platform (ALL)
- Invest in a car (Membership carded user, depending on car level)
- Withdraw the invested + profit of the user (Membership carded user)
- Withdraw for process of the funds and subsequent refill (CFO)
- Pause or change status in any investment contract (CEO)
- Completely pause the platform (C Level)
- Completely unpause the platform (CEO)
- Buy Membership card (User)
- Claim piece {from user current level} (Membership carded user)
- Claim next level {based on user current level} (Membership carded user)
- Generate a new entry batch (CEO)
- Set Membership card price (CEO through generating a new batch)
- Withdraw the Membership card sell revenue (CFO)
- Change CFO (CEO)
- Change CEO (CEO)

<!-- TOC --><a name="use-cases-"></a>
### Use cases ⛹️‍♀️

1. The investment contract has an estimate end date, but this can be changed due to less investments than expected and an agreement with the seller of the car.
2. When the investment contract reaches the maximum or reaches the end date, the CFO will withdraw all tokens to begin with the process, from this moment on, this contract will be impossible to invest in. After the process of restoration and selling is completed, the CFO sets the profit rate and refills the contract, with the previous total investment plus the necessary to cover the profit rates of the users.
3. When a new entry batch is created, the CEO can set a new price for the batch and a new uri for this token.


<!-- TOC --><a name="technical-requirements-"></a>
## Technical requirements 😮‍💨

This project has been developed with Solidity language, using Hardhat as a
development environment. Typescript is the selected language for testing and scripting. In addition, OpenZeppelin’s libraries are used in the project. All
information about the contracts library and how to install it can be found in
their GitHub.

In the project folder, the following structure is found:

[Link](https://tree.nathanfriend.io/?s=(%27optibs!(%27fancy!true~fullPath!false~trailxgSlash!true~rootDot!false)~X(%27X%27SomethxgLegendary-SmartV4artifacO4node_modules4typechax-types4V*CoxT87Y7IKW7IHBaseQCoreQLevelsQLogicsQMicroSloO7H9.sol4scripO*deploy6deployIK6iK5kL16iK10kL26iK15kL3JJPayWTokenJ9J9L26totalSupply.O4t8s*%20YGIKWGLogicsG9GUserPathsT8.O%5Cn4utils%20*%20addresses.O4.envTemplate4.mocharcNflow.md4hardhat.cbfig.O4Z-lockNZNREADME.md4yarn.lock%27)~versib!%271%27)*4q%204%5Cnq6.O*7.sol*8est9PuzzleGT86%20HSLPermissibsQJ6mxtKnv8N.jsb4OtsQ7SLVcbtracOWmentXsource!YFactoryZpackagebonq%20%20xin%01xqbZYXWVQONKJHG98764*)

SomethingLegendary-Smartcontracts/

├── artifacts

├── node_modules

├── typechain-types

├── contracts/

│   ├── CoinTest.sol

│   ├── Factory.sol

│   ├── Investment.sol
│   ├── ISLPermissions.sol
│   ├── SLBase.sol
│   ├── SLCore.sol
│   ├── SLLevels.sol
│   ├── SLLogics.sol
│   ├── SLMicroSlots.sol
│   ├── SLPermissions.sol
│   └── SLPuzzle.sol
├── scripts/
│   ├── deploy.ts
│   ├── deployInvest.ts
│   ├── invest5kL1.ts
│   ├── invest10kL2.ts
│   ├── invest15kL3.ts
│   ├── mint.ts
│   ├── mintPaymentToken.ts
│   ├── mintPuzzle.ts
│   ├── mintPuzzleL2.ts
│   └── totalSupply.ts
├── tests/
│   ├── FactoryTest.ts
│   ├── InvestmentTest.ts
│   ├── LogicsTest.ts
│   ├── PuzzleTest.ts
│   └── UserPathsTest.ts
├── utils /
│   └── addresses.ts
├── .envTemplate
├── .mocharc.json
├── [flow.md](http://flow.md/)
├── hardhat.config.ts
├── package-lock.json
├── package.json
├── [README.md](http://readme.md/)
└── yarn.lock

Start with “Getting started” to find all basic information about project structure and scripts that are required to test and deploy the contracts.


<!-- TOC --><a name="quick-overview-"></a>
### Quick overview 👀

Inside the ./contracts folder, Factory.sol contains the smart contract
responsible for deploying new investment contracts. Investment.sol contains the smart contract that is deployed by the Factory, each one of the deployed smart contracts represents the investment on one car. SLPermissions.sol contains the contract responsible for access control, this centralizes de CEO/CFO role across the platform. SLBase only contains core code, all of the ERC1155 communications and memory writting calls happens through here! It imports code from OpenZeppelin, such as ERC1155.sol and ReentrancyGuard.sol, as well as our own SLMicroSlots.sol, that uses math to store multiple ints in just one variable. SLLevels.sol inherits from SLBase.sol and it implements level related functions from SLBase.sol just as well as it contains one internal function to process the buying of a Membership card, and a few getter functions. SLPuzzles.sol will inherit from SLLevels.sol thus inheriting from SLBase.sol, it will implement Puzzle related functions from SLBase.sol as well as a getter function. Finally, SLCore is the last of this schema and contains/implements all available to interact functions, all functions that can be interacted from a wallet or a smart contract, are implemented here (of course we are not counting ERC1155 external/public functions). SLLogics is responsible for being the bridge between Factory.sol and SLCore.sol, aswell as hold the information of the entry token batches’ such as price and uri, it will also hold the funds collected from the selling of entry tokens as well as the logic that allows, or not, a user to claim a piece.

The ./tests provides the tests of the
different methods of the different smart contracts, in Typescript. I
The main contract can be deployed using: (See Getting started)
The project configuration is found in hardhat.config.ts, where dependencies
are indicated. Mind the relationship of this file with .env. A basic
configuration of Polygon’s Mumbai testnet is described in order to deploy the
contract. And an etherscan key is set to to configure its different
functionalities directly from the repo. More information about this file’s
configuration can be found in the Hardhat Documentation.


<!-- TOC --><a name="architecture-overview-"></a>
### Architecture Overview 🏛

!https://prod-files-secure.s3.us-west-2.amazonaws.com/5741542a-1f4b-44fa-aeb9-899d9444ff99/4887767a-d260-4d10-b7c5-655a73d5a670/Untitled.png

Something Legendary Smartcontracts schema

This schema can be divided in some parts of interest:

- SLCore group:
    - Responsible for the gamification of the project.
    - NFTs regarding both levels and puzzles are created and managed here.
- Investments Group:
    - Responsible for the deployment of Investment smartcontracts.
    - Responsible for holding information regarding user total investment and user total investment per level.
- Logics groups:
    - Responsible for payment of membership card
    - Responsible to hold info (uri/price) of membership card batches
    - Responsible to assure if a user is
    - Responsible to assure if a user is eligible to claim a puzzle piece.
- Permissions group:
    - Responsible for access control and role management.
    - CEO and CFO roles are defined here.

<!-- TOC --><a name="dependencies-"></a>
### Dependencies 🦿

**Package manager**

- [*Yarn](https://yarnpkg.com/)*:
- **Version:** 3.3.0
- **Description:** Yarn is a popular package manager for JavaScript, often used for managing project dependencies.

These dependencies are crucial for developing, testing, and deploying your Ethereum smart contracts and other components of your project. Make sure to manage and update them as needed.

**Development dependencies**

- [*Hardhat](https://hardhat.org/):**
- **Version:** ^2.12.7
- **Description:** Hardhat is a development environment for Ethereum that makes it easy to compile, deploy, and test your smart contracts.
- [*Ethers.js](https://docs.ethers.io/v5/):**
- **Version:** ^5.0.0
- **Description:** Ethers.js is a JavaScript library for interacting with Ethereum. It's widely used for building Ethereum applications, including smart contract interactions.
- [*Hardhat Ethers](https://hardhat.org/plugins/nomiclabs-hardhat-ethers.html):**
- **Version:** ^2.2.2
- **Description:** This plugin allows for seamless integration between Hardhat and the Ethers.js library, making it easier to work with Ethereum in your development environment.
- [*Hardhat Etherscan](https://hardhat.org/plugins/nomiclabs-hardhat-etherscan.html):**
- **Version:** ^3.0.0
- **Description:** This plugin provides Hardhat integration with Etherscan for easy verification of smart contracts on the Ethereum blockchain.

**[Hardhat Gas Reporter](https://hardhat.org/plugins/hardhat-gas-reporter.html)**:

- **Version:** ^1.0.8
- **Description:** This plugin is used for generating gas consumption reports, which can be helpful for optimizing your smart contracts.
- [*TypeScript](https://www.typescriptlang.org/):**
- **Version:** >=4.5.0
- **Description:** TypeScript is a statically typed superset of JavaScript, commonly used for building robust and maintainable smart contracts and applications.
- [*Typechain](https://github.com/ethereum-ts/TypeChain):**
- **Version:** ^8.1.0
- **Description:** Typechain generates TypeScript typings for your Ethereum smart contracts, making it easier to work with contracts in a type-safe manner.
- [*Chai](https://www.chaijs.com/):**
- **Version:** ^4.2.0
- **Description:** Chai is an assertion library for JavaScript, often used in combination with Mocha for writing tests.
- [*Mocha](https://mochajs.org/):**
- **Version:** ^10.1.0
- **Description:** Mocha is a popular JavaScript test framework used for writing and running tests for your smart contracts.

**Ethereum Development Dependencies**

- [*OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/4.x/):**
- **Version:** ^4.8.0
- **Description:** OpenZeppelin Contracts provides a collection of reusable smart contracts for building secure and audited Ethereum applications.
- [*Chainlink Contracts](https://chain.link/):**
- **Version:** ^0.5.1
- **Description:** Chainlink Contracts provide decentralized oracles for Ethereum, enabling external data to be accessed by your smart contracts.

**Utility Dependencies**

- [*dotenv](https://www.npmjs.com/package/dotenv):**
- **Version:** ^16.0.3
- **Description:** dotenv is a zero-dependency module for loading environment variables from a `.env` file into `process.env`.
- [*Solidity Coverage](https://github.com/sc-forks/solidity-coverage):**
- **Version:** ^0.8.0
- **Description:** Solidity Coverage is a code coverage tool specifically designed for Solidity smart contracts.


<!-- TOC --><a name="contract-information-"></a>
### Contract Information ℹ️

This section contains detailed information (their purpose, assets, functions,
and events) about the contracts used in the project.

**Factory.sol**

This contract is responsible for deploying new Investment contracts and managing them.

**Contract Deployment and deployment of investment contracts:**

1. For the contract deployment, SLPermissions must be deployed first, since it requires its address as a parameter.
2. For the deployment of an investment contract, SLCore must de deployed and a valid PaymentToken address must be passed as well as an existing level.
3. The CEO creates a new investment contract by calling:

```solidity
/// @notice Deploys a new Investment contract with the specified parameters.
/// @dev The function requires the caller to be a CEO and the platform to be active. It also checks if the slCoreAddress and _paymentTokenAddress are not zero addresses and if the _level is within the range 1-3.
/// @param  _totalInvestment The total amount of tokens needed to fulfill the investment.
/// @param  _paymentTokenAddress The address of the token management contract.
/// @param _level The level of the new Investment contract.
/// @return The address of the newly deployed Investment contract.
/// @custom:requires  1 <= level <= 3 and CEO access Level
function deployNew(
	uint256 _totalInvestment,
	address _paymentTokenAddress,
	uint256 _level
) external isCEO isNotGloballyStoped returns (address) {}

```

**Setting the SLCore Address**

1. The CEO is able to set the SLCore address through setSLCoreAddress() function

```solidity
/// @notice Updates the SLCore address.
/// @dev The function requires the caller to be a CEO and the platform to be active. It also checks if the _slCoreAddress is not a zero address.
/// @param  _slCoreAddress The new SLCore address.
/// @custom:requires  CEO access Level
/// @custom:intent If SLCore gets compromised, there's a way to fix the factory withouth the need of redeploying
function setSLCoreAddress(
	address _slCoreAddress
) external isCEO isNotGloballyStoped {}

```

**Getter functions**

Additionally, there are different getter functions, that can be called to
retrieve relevant data from the contract:

```solidity
/// @notice Returns the total amount invested by the user across all levels.
/// @dev The function iterates over all deployed contracts and sums up the balance of the user in each contract.
/// @param _user The address of the user.
/// @return userTotal The total amount invested by the user.
function getAddressTotal(
    address _user
) external view returns (uint256 userTotal) {}

/// @notice Returns the total amount invested by all users across all levels.
/// @dev The function iterates over all deployed contracts and sums up the totalSupply (representative of the investments) in each contract.
/// @return platformTotal The total amount invested by all users in the platform.
function getTotalInvestedInPlatform()
    external
    view
    returns (uint256 platformTotal) {}

/// @notice Returns the total amount invested by the user at a specific level.
/// @dev The function iterates over all deployed contracts at the specified level and sums up the balance of the user in each contract.
/// @param _user The address of the user.
/// @param _level The level of the Investment contracts.
/// @return userTotal The total amount invested by the user at the specified level.
function getAddressTotalInLevel(
    address _user,
    uint256 _level
) external view returns (uint256 userTotal) {}

/// @notice Returns the total amount invested by the caller in a specific contract.
/// @dev The function gets the balance of the caller in the specified contract.
/// @param _contractAddress The address of the Investment contract.
/// @return userTotal The total amount invested by the caller in the specified contract.
function getAddressOnContract(
    address _contractAddress
) external view returns (uint256 userTotal) {}

/// @notice Returns the address of the last deployed Investment contract at a specific level.
/// @dev The function returns a zero address if there are no deployed contracts at the specified level.
/// @param  _level The level of the Investment contracts.
/// @return contractAddress The address of the last deployed Investment contract at the specified level.
function getLastDeployedContract(
    uint256 _level
) external view returns (address contractAddress) {}

```

**Entities**

```solidity
/// @notice A mapping that stores deployed Investment contracts by their level.
/// @dev The key is the level of the Investment contract and the value is an array of Investment contracts at that level.
mapping(uint256 => Investment[]) public deployedContracts;
/// @notice Stores SLCore address
/// @dev Used to initialize Investment contracts
address public slCoreAddress;
/// @notice Stores SLPermissions address
/// @dev Used to Control Access to certain functions
address public immutable SLPERMISSIONS_ADDRESS;

```

**Events**

```solidity
/// @notice An event that is emitted when a new Investment contract is deployed.
/// @param ContractID The ID of the new contract in its level.
/// @param conAddress The address of the new contract.
/// @param conLevel The level of the new contract.
event ContractCreated(
	uint256 indexed ContractID,
	address indexed conAddress,
	uint256 indexed conLevel
);

```

**Errors**

```solidity
/// @notice Reverts if a certain address == address(0)
/// @param reason which address is missing
error InvalidAddress(string reason);

/// @notice Reverts if input is not in level range
/// @param input level inputed
/// @param min minimum level value
/// @param max maximum level value
error InvalidLevel(uint256 input, uint256 min, uint256 max);

/// @notice Reverts if platform is paused
error PlatformPaused();

///Function caller is not CEO level
error NotCEO();

```

**Modifiers**

```solidity
/// @notice Verifies if platform is paused.
/// @dev If platform is paused, the whole contract is stopped
modifier isNotGloballyStoped() {}

/// @notice Verifies if user is CEO.
/// @dev CEO has the right to interact with: deployNew() and setSLCoreAddress()
modifier isCEO() {}

```

**Functions**

```solidity
/// @notice Deploys a new Investment contract with the specified parameters.
/// @dev The function requires the caller to be a CEO and the platform to be active. It also checks if the slCoreAddress and _paymentTokenAddress are not zero addresses and if the _level is within the range 1-3.
/// @param  _totalInvestment The total amount of tokens needed to fulfill the investment.
/// @param  _paymentTokenAddress The address of the token management contract.
/// @param _level The level of the new Investment contract.
/// @return The address of the newly deployed Investment contract.
/// @custom:requires  1 <= level <= 3 and CEO access Level
function deployNew(
    uint256 _totalInvestment,
    address _paymentTokenAddress,
    uint256 _level
) external isCEO isNotGloballyStoped returns (address) {}

/// @notice Updates the SLCore address.
/// @dev The function requires the caller to be a CEO and the platform to be active. It also checks if the _slCoreAddress is not a zero address.
/// @param  _slCoreAddress The new SLCore address.
/// @custom:requires  CEO access Level
/// @custom:intent If SLCore gets compromised, there's a way to fix the factory without the need of redeploying
function setSLCoreAddress(
    address _slCoreAddress
) external isCEO isNotGloballyStoped {}

```

**Investment.sol**

This contract is responsible for the management of investment contracts.

**Contract Deployment :**

1. The contract needs to be deployed from the Factory.sol contract
2. For the deployment of an investment contract, SLCore must de deployed and a valid PaymentToken address must be passed as well as an existing level.
3. Several parameters will be defined upon construction, as seen below:

```solidity
///
/--CONSTRUCTO
///
/// @notice Initializes contract with given parameters.
/// @dev Requires a valid SLCore address and payment token address.
/// @param _totalInvestment The total value of the investment.
/// @param _slPermissionsAddress The address of the Access Control contract.
/// @param _slCoreAddress The SLCore address.
/// @param  _paymentTokenAddress0 The address of the payment token 0.
/// @param  _paymentTokenAddress1 The address of the payment token 1.
/// @param _contractLevel The level of this contract.
constructor(
    uint256 _totalInvestment,
    address _slPermissionsAddress,
    address _slCoreAddress,
    address _paymentTokenAddress0,
    address _paymentTokenAddress1,
    uint256 _contractLevel
) ERC20("InvestmentCurrency", "IC") {
    if (_slCoreAddress == address(0)) {
        revert InvalidAddress("SLCore");
    }
    if (_paymentTokenAddress0 == address(0)) {
        revert InvalidAddress("PaymentToken0");
    }
    if (_paymentTokenAddress1 == address(0)) {
        revert InvalidAddress("PaymentToken1");
    }
    TOTAL_INVESTMENT = _totalInvestment * 10 ** decimals();
    SLPERMISSIONS_ADDRESS = _slPermissionsAddress;
    SLCORE_ADDRESS = _slCoreAddress;
    PAYMENT_TOKEN_ADDRESS_0 = _paymentTokenAddress0;
    PAYMENT_TOKEN_ADDRESS_1 = _paymentTokenAddress1;
    _changeStatus(Status.Progress);
    CONTRACT_LEVEL = _contractLevel;
}

```

**Contract phases**

1. Pause - Used only when a bug or exploit is detected and we need to limit damage.
2. Progress - Phase where investing is allowed.
3. Process - Phase where the CFO collects the funds, the “real-life” process of restoration and subsequent selling of the classic car happens here.
4. Withdraw - Phase where all the users who have invested, can withdraw their investment plus their earnings.
5. Refunding - Phase where the users will be able to withdraw their investment without the profits. only happens in exploit/bug scenarios.

**Making an investment**

1. In order to do an investment, the contract must be in “Progress” phase.
2. Any user with the required level will be able to invest in the contract, calling:

```solidity
/// @notice Allows a user to invest a certain amount.
/// @dev The function requires the contract to be in Progress status and the platform to be active.
/// @param _amount The amount to be invested.
function invest(
    uint256 _amount,
    uint256 _paymentToken
) public nonReentrant isAllowed isProgress isNotGloballyStoped {}

```

**Withdrawing/Refunding**

1. Any user with the required level and an investment done will be able to get the funds.
2. The funds can only be withdrew/refunded if the contract is in “Withdraw” or “Refund” status.
3. The function called in case of refund is exactly the same as in case of withdraw, thus why the profit rate is only settled after the investment is passed to withdraw state with a refill (see below).
4. The action can be performed calling:

```solidity
/// @notice Allows a user to withdraw their investment.
/// @dev The function requires the contract to be in Withdraw or Refunding status and the platform to be active.
/// @custom:logic If the contract is in Refunding status, profit will be 0, and users will withdraw exactly the same amount invested
function withdraw()
    external
    nonReentrant
    isAllowed
    isWithdrawOrRefunding
    isNotGloballyStoped
{}

```

**Company withdraw and refill**

1. The funds can only be withdrew/refilled if the contract is in “Process” status.
2. The functions require the CFO to be the caller.
3. This actions can be performed calling:

```solidity
// @notice Allows the CFO to withdraw funds for processing.
/// @dev The function requires the contract to be in Process status and the platform to be active.
function withdrawSL() external isProcess isNotGloballyStoped isCFO {}

// @notice Allows the CFO to refill the contract.
/// @dev The function requires the contract to be in Process status and the platform to be active.
/// @param _amount The amount to be refilled.
/// @param _profitRate The profit rate for the refill.
function refill(
    uint256 _amount,
    uint256 _profitRate
) public nonReentrant isNotGloballyStoped isProcess isCFO {}

```

**Getter functions**

Additionally, there are different getter functions, that can be called to
retrieve relevant data from the contract:

```solidity
/// @notice returns the total invested by users
/// @return totalBalance the total amount invested
function totalContractBalance() public view returns (uint256 totalBalance) {}

function totalContractBalanceForEachPaymentToken()
    public
    view
    returns (uint256 paymentToken0Balance, uint256 paymentToken1Balance) {}

/// @notice Calculates the possible amount to invest
/// @dev Checks if the contract is more than 90% full and returns the remaining amount to fill, if not, returns 10% of the total investment
/// @return maxToInvest max allowed to invest at any time (by a user that didn't invest yet)
function getMaxToInvest() public view returns (uint256 maxToInvest) {}

/// @notice calculates the amount that the user has for withdrawal
/// @dev if the profit rate is 0, the amount returned will be the same as the amount invested
/// @param _amount amount invested by the user
/// @return totalAmount amount that the user has the right to withdraw
/// @custom:obs minimum amount returned: [{_amount}]
function calculateFinalAmount(
    uint256 _amount
) internal view returns (uint256 totalAmount) {}

```

**Structs**

```solidity
/// @notice Enum for the status of the contract.
/// @dev The status can be Pause, Progress, Process, Withdraw, or Refunding.
enum Status {
    Pause,
    Progress,
    Process,
    Withdraw,
    Refunding
}

```

**Entities**

```solidity
/// @notice The status of the contract.
/// @dev The status is public and can be changed through the changeStatus function.
Status public status;

/// @notice The total investment in the contract.
/// @dev This value is immutable and set at the time of contract deployment.
uint256 public immutable TOTAL_INVESTMENT;

/// @notice The return profit.
/// @dev This value is set as 0 until the contract is refilled.
uint256 public returnProfit;

/// @notice The address of the payment token.
/// @dev This value is set at the time of contract deployment.
address public immutable PAYMENT_TOKEN_ADDRESS_0;

/// @notice The address of the payment token.
/// @dev This value is set at the time of contract deployment.
address public immutable PAYMENT_TOKEN_ADDRESS_1;

/// @notice The address of SLCore contract.
/// @dev This value is set at the time of contract deployment.
address public immutable SLCORE_ADDRESS;

/// @notice The address of the Access Control contract.
/// @dev This value is set at the time of contract deployment.
address public immutable SLPERMISSIONS_ADDRESS;

/// @notice Minimum investment amount
/// @dev This value is set at the time of contract deployment.
uint256 public constant MINIMUM_INVESTMENT = 100;

/// @notice The Level of the contract.
/// @dev This value is set at the time of contract deployment.
uint256 public immutable CONTRACT_LEVEL;

/// @notice Stores if a user has withdrawn.
/// @dev Keeps a user from withdrawing twice.
mapping(address => uint256) public userWithdrew;

```

**Events**

```solidity
/// @notice An event that is emitted when a user invests.
/// @param user The address of the user who invested.
/// @param amount The amount invested.
/// @param time The timestamp where the action was performed.
/// @param paymentToken The address of the payment token used.
event UserInvest(
    address indexed user,
    uint256 indexed amount,
    uint256 indexed time,
    address paymentToken
);

/// @notice An event that is emitted when a user withdraws.
/// @param user The address of the user.
/// @param amount The amount withdrawn.
/// @param time The timestamp where the action was performed.
event Withdraw(
    address indexed user,
    uint256 indexed amount,
    uint256 indexed time
);

/// @notice An event that is emitted when Something Legendary withdraws tokens for processing.
/// @param amount The amount withdrawn.
/// @param time The timestamp where the action was performed.
event SLWithdraw(uint256 indexed amount, uint256 indexed time);

/// @notice An event that is emitted when Something Legendary refills the contract with tokens.
/// @param amount The amount refilled.
/// @param profit The profit rate.
/// @param time The timestamp where the action was performed.
event ContractRefilled(
    uint256 indexed amount,
    uint256 indexed profit,
    uint256 indexed time
);

/// @notice An event that is emitted when the contract is filled by an investment.
/// @param time The timestamp where the action was performed.
event ContractFilled(uint256 indexed time);

```

**Errors**

```solidity
/// @notice Reverts if a certain address == address(0)
/// @param reason which address is missing
error InvalidAddress(string reason);

/// @notice Reverts if input is not in level range
/// @param input level inputed
/// @param min minimum level value
/// @param max maximum level value
error InvalidLevel(uint256 input, uint256 min, uint256 max);

/// Investing amount exceeded the maximum allowed
/// @param amount the amount the user is trying to invest
/// @param minAllowed minimum amount allowed to invest
/// @param maxAllowed maximum amount allowed to invest
error WrongfulInvestmentAmount(
    uint256 amount,
    uint256 minAllowed,
    uint256 maxAllowed
);

/// @notice Reverts if input is not in level range
/// @param currentStatus current contract status
/// @param expectedStatus expected status for the function to run
error InvalidContractStatus(Status currentStatus, Status expectedStatus);

/// @notice Reverts if input is not in level range
/// @param input the invalid selected coin to pay
/// @param firstCoinId the first allowed coin number
/// @param secondCoinId the second allowed coin number
error InvalidPaymentId(uint input, uint firstCoinId, uint secondCoinId);

/// @notice Reverts if the user is not at least at contract level
/// @param expectedLevel expected user minimum level
/// @param userLevel user level
error IncorrectUserLevel(uint256 expectedLevel, uint256 userLevel);

/// @notice reverts if refill value is incorrect
/// @param expected expected refill amount
/// @param input input amount
error IncorrectRefillValue(uint256 expected, uint256 input);

/// @notice reverts if platform hasn't enough investment for starting the process
/// @param expected expected investment total
/// @param actual actual investment total
error NotEnoughForProcess(uint256 expected, uint256 actual);

/// @notice reverts if the user tries a second withdraw
error CannotWithdrawTwice();

/// @notice Reverts if the platform is paused
error PlatformPaused();

/// Function caller is not CEO level
error NotCEO();

/// Function caller is not CFO level
error NotCFO();

```

**Modifiers**

```solidity
/// @notice Verifies if the platform is paused.
/// @dev If the platform is paused, the whole contract is stopped.
modifier isNotGloballyStoped() {}

/// @notice Verifies if the contract is in progress status.
/// @dev If the contract is in progress, the only available functions are invest() and changeStatus().
modifier isProgress() {}

/// @notice Verifies if the contract is in process status.
/// @dev If the contract is in process, the only available functions are withdrawSL(), changeStatus(), and refill().
modifier isProcess() {}

/// @notice Verifies if the contract is in withdraw or refunding status.
/// @dev If the contract is in progress, the only available functions are withdraw(), changeStatus().
modifier isWithdrawOrRefunding() {}

/// @notice Verifies if the user has the necessary NFT to interact with the contract.
/// @dev The user should be at least the same level as the contract.
modifier isAllowed() {}

/// @notice Verifies if the user is the CEO.
/// @dev The CEO has the right to interact with: changeStatus().
modifier isCEO() {}

/// @notice Verifies if the user is the CFO.
/// @dev The CFO has the right to interact with: withdrawSL() and refill().
modifier isCFO() {}

```

**Functions**

```solidity
/// @notice Allows a user to invest a certain amount.
/// @dev The function requires the contract to be in Progress status and the platform to be active.
/// @param _amount The amount to be invested.
function invest(
    uint256 _amount,
    uint256 _paymentToken
) public nonReentrant isAllowed isProgress isNotGloballyStoped {}

/// @notice Allows a user to withdraw their investment.
/// @dev The function requires the contract to be in Withdraw or Refunding status and the platform to be active.
/// @custom:logic If the contract is in Refunding status, profit will be 0, and users will withdraw exactly the same amount invested.
function withdraw() external nonReentrant isAllowed isWithdrawOrRefunding isNotGloballyStoped {}

/// @notice Allows the CFO to withdraw funds for processing.
/// @dev The function requires the contract to be in Process status and the platform to be active.
function withdrawSL() external isProcess isNotGloballyStoped isCFO {}

/// @notice Allows the CFO to refill the contract.
/// @dev The function requires the contract to be in Process status and the platform to be active.
/// @param _amount The amount to be refilled.
/// @param _profitRate The profit rate for the refill.
function refill(
    uint256 _amount,
    uint256 _profitRate
) public nonReentrant isNotGloballyStoped isProcess isCFO {}

```

**Overrides**

```solidity
/// @notice Returns the number of decimals for the investment token. It is the same number of decimals as the payment token!
/// @dev This function is overridden from the ERC20 standard.
function decimals() public view override returns (uint8) {
    return 6;
}

/// @notice Disallows investment token transfers from one address to another.
/// @dev This function is overridden from the ERC20 standard and always returns false.
/// @param from The address to NOT transfer from.
/// @param to The address to NOT transfer to.
/// @param amount The amount to NOT be transferred.
function transferFrom(
    address from,
    address to,
    uint256 amount
) public override returns (bool) {
    return false;
}

/// @notice Disallows investment token transfers to another wallet.
/// @dev This function is overridden from the ERC20 standard and always returns false.
/// @param to The address to NOT transfer to.
/// @param amount The amount to NOT be transferred.
function transfer(
    address to,
    uint256 amount
) public override returns (bool) {
    return false;
}

```

**SLPermissions.sol**

This facet controls access control for Something Legendary. There are three roles managed here:

- The CEO: The CEO can reassign other roles and change the addresses of our dependent smart contracts. It is also the only role that can unpause the smart contract. It is initially set to the address that created the smart contract in the constructor.
- The CFO: The CFO can withdraw/refill funds from every investment contract, and withdraw the membership card revenue.
- The allowed contracts: The allowed contracts represents the current SLCore contract, to give it ability to use SLLogics with access control.

**Contract Deployment :**

1. For the contract deployment, a valid CEO and CFO address must be passed.
2. For the correct working of the platform, SLCore (when deployed) must be setted as allowed contract
3. The constructor:

```solidity
/// @notice Initializes the Permissions contract
/// @param _ceoAddress The address of the CEO
/// @param _cfoAddress The address of the CFO.
constructor(address _ceoAddress, address _cfoAddress) {
    ceoAddress = _ceoAddress;
    cfoAddress = _cfoAddress;
}

```

**Contract status**

Each of this status is able to affect the whole platform:

1. Paused - Complete platform pause
2. Paused entry mint - Paused membership card minting.
3. pausedPuzzleMint - Paused puzzle pieces nft and levels nft minting.
4. pausedInvestments - Paused all investent contracts.

**Changing CEO/CFO**

1. In order to change the CEO or CFO, the contract can be in any state, since the usage would probably mean an exploit/bug, and the contract may need to be paused.
2. Only the CEO will be able to set this roles , calling:

```solidity
/// @dev Assigns a new address to act as the CEO. Only available to the current CEO.
/// @param _newCEO The address of the new CEO
function setCEO(address _newCEO) external onlyCEO {}

/// @dev Assigns a new address to act as the CFO. Only available to the current CEO.
/// @param _newCFO The address of the new CFO
function setCFO(address _newCFO) external onlyCEO {}

```

**Setting a contract as allowed/disallowed**

1. In order to change the allowance of a contract or set a new one, the contract can be in any state, since the usage would probably mean an exploit/bug, and the contract may need to be paused.
2. Only the CEO will be able to set this role , calling:

```solidity
/// @dev assigns a boolean value for contract access control
/// @param _contractAddress The address of the contract
/// @param _allowed The new status for the access control
function setAllowedContracts(address _contractAddress, uint256 _allowed) external onlyCEO {}

```

**Pause/Unpause sections**

1. The action of pausing can be called by any CLevel wallet while the unpause action can only be perfomed by the CEO.
2. This actions can be performed calling:

```solidity
/// @dev Called by any "C-level" role to pause each of the functionalities. Used only when
/// a bug or exploit is detected and we need to limit damage.
function pausePlatform() external onlyCLevel {}

function pauseEntryMint() external onlyCLevel {}

function pausePuzzleMint() external onlyCLevel {}

function pauseInvestments() external onlyCLevel {}

/// @dev Unpauses the functionalities. Can only be called by the CEO, since
/// one reason we may pause the contract is when CFO account is
/// compromised.
function unpausePlatform() external onlyCEO {}

function unpauseEntryMint() external onlyCEO {}

function unpausePuzzleMint() external onlyCEO {}

function unpauseInvestments() external onlyCEO {}

```

**Getter functions**

Additionally, there are different getter functions, that can be called to
retrieve relevant data from the contract:

```solidity
/// @notice External function for CEO verification
/// @param _address Caller address
function isCEO(address _address) external view returns (bool) {}

/// @notice External function for CFO verification
/// @param _address Caller address
function isCFO(address _address) external view returns (bool) {}

/// @notice External function for CEO or CFO verification
/// @param _address Caller address
function isCLevel(address _address) external view returns (bool) {}

/// @notice External function for allowed-contract verification
/// @param _conAddress Caller contract address
function isAllowedContract(address _conAddress) external view returns (bool) {}

/// @dev Function to allow actions only when the contract IS NOT paused
function isPlatformPaused() external view returns (bool) {}

/// @dev Function to allow actions only when the contract IS NOT paused
function isEntryMintPaused() external view returns (bool) {}

/// @dev Function to allow actions only when the contract IS NOT paused
function isClaimPaused() external view returns (bool) {}

/// @dev Function to allow actions only when the contract IS paused
function isInvestmentsPaused() external view returns (bool) {}

```

**Entities**

```solidity
/// @notice The CEO address.
/// @dev This value is changeable.
address public ceoAddress;

/// @notice The CFO address.
/// @dev This value is changeable.
address public cfoAddress;

/// @notice The mapping with allowed contracts.
/// @dev The key is the contract address; permissions can be withdrawn from the contract.
mapping(address => uint256) public allowedContracts;

/// @notice The global platform pause.
/// @dev When true, the whole platform stops working.
uint256 public paused = 0;

/// @notice The entry minting pause.
/// @dev When true, the minting entry NFTs is disallowed.
uint256 public pausedEntryMint = 0;

/// @notice The levels and puzzles pause.
/// @dev When true, the claiming of new pieces or puzzles is disallowed.
uint256 public pausedPuzzleMint = 0;

/// @notice The global investment pause.
/// @dev When true, every investment in the platform is stopped.
uint256 public pausedInvestments = 0;

```

**Errors**

```solidity
/// @notice Reverts if a certain address == address(0)
/// @param reason Which address is missing
error InvalidAddress(string reason);

/// @notice Reverts if a certain input value is greater than a maximum value
/// @param max Maximum input value
/// @param input Input value
error InvalidNumber(uint max, uint input);

/// Reverts if the function caller is not a CEO level
error NotCEO();

/// Reverts if the function caller is not a CEO or CFO level
error NotCLevel();

```

**Modifiers**

```solidity
/// @dev Access modifier for CEO-only functionality
modifier onlyCEO() {}

/// @dev Access modifier for CEO-CFO-only functionality
modifier onlyCLevel() {}

```

**Functions**

```solidity
/// @dev Assigns a new address to act as the CEO. Only available to the current CEO.
/// @param _newCEO The address of the new CEO
function setCEO(address _newCEO) external onlyCEO {}

/// @dev Assigns a new address to act as the CFO. Only available to the current CEO.
/// @param _newCFO The address of the new CFO
function setCFO(address _newCFO) external onlyCEO {}

/// @dev Called by any "C-level" role to pause each of the functionalities. Used only when
/// a bug or exploit is detected and we need to limit damage.
function pausePlatform() external onlyCLevel {}

function pauseEntryMint() external onlyCLevel {}

function pausePuzzleMint() external onlyCLevel {}

function pauseInvestments() external onlyCLevel {}

/// @dev Unpauses the functionalities. Can only be called by the CEO, since
/// one reason we may pause the contract is when CFO account is
/// compromised.
function unpausePlatform() external onlyCEO {}

function unpauseEntryMint() external onlyCEO {}

function unpausePuzzleMint() external onlyCEO {}

function unpauseInvestments() external onlyCEO {}

```

**SLMicroSlots.sol**

In this contract we use math to compute the uint that contains multiple values stored inside. A simple example would be storing 3 different price for wheels, lets say 10€, 15€ and 20€. It would be stored in just one variable: 201510, and retrieved by this contract. This makes the use of multiple variable unnecessary, creating cheaper transactions and deployments.

**Contract Deployment**

1. This contract must not be deployed, it should be inherited by the contract you want to use it.

**Reading a value from the variable**

1. All extracting factions use the same base function to get the correct number from a unit value.
2. This function will get the position designated by X in a factor of Y meaning, that the result will come from the position X with Y characters. Quick example, take the 201510, and set X = 2, Y = 2. What would the result be? 🤔:

```solidity
//Get a number of digits in x position of a number
    /// @notice Returns the position X in slots of Y size in a given number.
    /// @param number the uint256 from where the result is extracted
    /// @param position the psotion of the result
    /// @param factor number of algarisms in result
    /// @return uint256 the specified position in a number
    function getPositionXInDivisionByY(
        uint256 number,
        uint256 position,
        uint256 factor
    ) internal view returns (uint256) {}

```

1. You guessed 15? you’re right!! 🔥🎉

**Membership card info manipulation**

1. This contract manipulates the way the membership card batches’ info is stored.
2. The info is stored in an array, each index translates to the batch number, inside each postion of the array will be a number (uint) containing the batch limit (total supply) and the amount of membership cards sold from that batch.
3. As you could understand, this value needs to be updated every time a user buys a membership card.
4. The value is not only changed, but it needs to be reed, to assure there’s still membership cards to sell.
5. For this 2 actions (reading the current values and updating them) there are 2 functions:

```solidity
/// @notice mount the entry value for storage
/// @dev currentID can never be more than 9999
/// @param cap Collection limit
/// @param currentID the current token Id
/// @return uint24 the current information of the current lvl1 batch
function mountEntryValue(
    uint256 cap,
    uint256 currentID
) internal view returns (uint24) {}

/// @notice unmount the entry value for checking
/// @dev the returns allows checking for the limit of NFT minting
/// @param value the information regarding the current level1 batch
/// @return cap Collection limit
/// @return currentID the current token Id
function unmountEntryValue(
    uint24 value
) internal view returns (uint256 cap, uint256 currentID) {}

```

**Membership card token ID Generation**

1. You probably guess it right, how do they mint? Where is the collectionID stored? .
2. The ID is not stored, rather it is calculated every time a user buys a membership card, by this function:

```solidity
/// @notice Mount the entry value for storage.
/// @dev The currentID can never be more than 9999.
/// @param cap Collection limit.
/// @param currentID The current token ID.
/// @return uint24 The current information of the current lvl1 batch.
function mountEntryValue(uint256 cap, uint256 currentID) internal view returns (uint24) {}

```

**Errors**

```solidity
/// @notice Reverts if input is not in the specified range.
/// @param input The input number to check.
/// @param min The minimum allowed value (inclusive).
/// @param max The maximum allowed value (inclusive).
error InvalidRange(uint256 input, uint256 min, uint256 max);

```

**Functions**

```solidity
/// Get a number of digits in x position of a number
/// @notice Returns the position X in slots of Y size in a given number.
/// @param number The uint256 from where the result is extracted.
/// @param position The position of the result.
/// @param factor Number of digits in the result.
/// @return uint256 The specified position in a number.
function getPositionXInDivisionByY(}

/// @notice Returns an array of X positions in slots of Y size in a given number.
/// @param number The uint256 from where the result is extracted.
/// @param startPosition The position of the 1st element.
/// @param numberOfResults Number of results needed.
/// @param factor Number of digits in each result.
/// @return uint256 The specified positions in a number.
function getMultiplePositionsXInDivisionByY(
    uint256 number,
    uint256 startPosition,
    uint256 numberOfResults,
    uint256 factor
) internal view returns (uint256[] memory) {}

/// @notice Mount the entry value for storage.
/// @dev The currentID can never be more than 9999.
/// @param cap Collection limit.
/// @param currentID The current token ID.
/// @return uint24 The current information of the current lvl1 batch.
function mountEntryValue(uint256 cap, uint256 currentID) internal view returns (uint24) {}

/// @notice Unmount the entry value for checking.
/// @dev The returns allow checking for the limit of NFT minting.
/// @param value The information regarding the current level1 batch.
/// @return cap Collection limit.
/// @return currentID The current token ID.
function unmountEntryValue(uint24 value) internal view returns (uint256 cap, uint256 currentID) {}

/// @notice Mount the entry ID for ERC1155 minting.
/// @dev The entryID is defined with 2 static parameters of an entry batch, the batch number, and the limit of minting.
/// @param batch The number of the collection of entry NFTs.
/// @param cap Collection limit.
/// @return uint256 The ID from which the specified batch should be minted.
function mountEntryID(uint256 batch, uint256 cap) internal view returns (uint256) {}

/// @notice Unmount the entry ID.
/// @dev This allows to relate the batch with its cap.
/// @param id The level1 batch ID that needs to be read.
/// @return batch The number of the collection of entry NFTs.
/// @return cap Collection limit.
function unmountEntryID(uint256 id) public view returns (uint256 batch, uint256 cap) {}

/// @notice Function to increment a parcel of the number by 1.
/// @dev If the number gets to 999, the next number will be 0 since it is using a factor of 3 digits per parcel.
/// @param number The uint256 where the number is going to be incremented.
/// @param position The position for incrementing.
/// @return _final The number with the incremented parcel.
function incrementXPositionInFactor3(uint32 number, uint32 position) internal view returns (uint32 _final) {}

/// @notice Function to change a specific parcel of a number. -In parcels of 5 digits.
/// @dev Since it is using a factor of 5, the number cannot be bigger than 99999.
/// @param number The uint256 where the number is going to be replaced.
/// @param position The position for changing.
/// @param newNumber The new parcel.
/// @return _final The number with the replaced parcel.
function changetXPositionInFactor5(uint256 number, uint32 position, uint256 newNumber) internal view returns (uint256 _final) {}

```

**SLLogics.sol**

SLLogics serves multiples purposes:

- SLLogics is responsible for being the bridge between Factory.sol and SLCore.sol.
- SLLogics retrieves the payment of the membership card to avoid storing funds in SLCore.sol which is going to be used further more than SLLogics.sol. This helps SLCore to be less tempting for exploitation, since it is where the gamification happens and is stored.
- Since it retrieves the payment, it makes sense that it keeps the information about the price of the membership card as well as the uris for each batch.
- It also holds the logics that will allow, or not, a user to claim a puzzle piece.

**Contract Deployment :**

1. For the contract deployment, a valid factory address, payment token address and SLPermissions address must be passed.
2. For the correct working of the platform, SLCore (when deployed) must be settled as allowed contract in SLPermissions.sol, so it can communicate with this one.
3. The constructor:

```solidity
/// @notice Initializes the contract with the given parameters.
/// @dev Requires valid SLPermission, payment token, and factory addresses.
/// @param _factoryAddress The address of the factory contract.
/// @param _paymentTokenAddress The address of the payment token contract.
/// @param _slPermissionsAddress The address of the Access Control contract.
constructor(
    address _factoryAddress,
    address _paymentTokenAddress,
    address _slPermissionsAddress
) {}

```

**Withdraw membership cards’ revenue**

1. In order to collect the revenue, the caller must be the CFO.
2. This action is performed calling:

```solidity
/// @notice Allow the CFO of the contract to withdraw tokens from the contract's account
/// @dev Can only be called by the CFO of the contract
/// @param _user The address of the user
function withdrawTokens(address _user) external isCFO {}

```

**Paying the membership card price**

1. This can only be called by SLCore.sol contract, if it has been settled as an allowed contract in SLPermissions.sol, when a user buys the membership card.
2. This keys it necessary that the user approve the spending for this contract and not SLCore.sol
3. The revenue is stored here for security purposes.
4. This action is performed calling:

```solidity
/// @notice Transfer the entry fee from the user's account to the contract's account
/// @dev Uses the ERC20 `transferFrom` function
/// @param _user The address of the user
function payEntryFee(address _user) external isAllowedContract nonReentrant {}

```

**Setting the member ship batch price and uri**

1. This can only be called by SLCore.sol contrac, if it has been settled as an allowed contract in SLPermissions.sol, when the CEO creates a new batch.
2. This actions can be performed calling and passing the price for the batch and the uri:

```solidity
/// @notice Set the entry price for a new entry batch
/// @dev This function can only be called by one of the allowed contracts
/// @param _newPrice The price for the new entry batch
/// @param _tokenURI The URI for the new entry batch
function setEntryPrice(
    uint256 _newPrice,
    string memory _tokenURI
) external isAllowedContract {}

```

**Verify user ability to claim a piece**

1. This can be called by anyone since it doesn’t change the state of the contract.
2. This actions can be performed calling the external one:

```solidity
// Function to verify if a user has the right to claim the next level
/// @notice Check if a user is allowed to claim a puzzle piece, verifying that the user does not surpass a 999 piece limit per user per level
/// @dev Takes into account the user's current level and the number of puzzle pieces they have for their current level
/// @param _user The address of the user
/// @param _tokenId The ID of the token
/// @param _currentUserLevel The current level of the user
/// @param _userPuzzlePiecesForUserCurrentLevel The number of puzzle pieces the user has for their current level
function _userAllowedToClaimPiece(
    address _user,
    uint256 _tokenId,
    uint256 _currentUserLevel,
    uint256 _userPuzzlePiecesForUserCurrentLevel
) public view {}

/// @notice Check if a user is allowed to claim a puzzle piece
/// @dev Takes into account the user's current level and the number of puzzle pieces they have for their current level
/// @param _user The address of the user
/// @param _tokenId The ID of the token
/// @param _currentUserLevel The current level of the user
/// @param _userPuzzlePiecesForUserCurrentLevel The number of puzzle pieces the user has for their current level
/// @return A boolean indicating whether the user is allowed to claim the puzzle piece
function userAllowedToClaimPiece(
    address _user,
    uint256 _tokenId,
    uint256 _currentUserLevel,
    uint256 _userPuzzlePiecesForUserCurrentLevel
) public view returns (bool) {}

```

**Getter functions**

Additionally, there are different getter functions, that can be called to
retrieve relevant data from the contract:

```solidity
/// @notice Returns entry NFT price
/// @return uint256 Price of entry
function _getEntryPrice() public view returns (uint256) {}

/// @notice Returns the minimum amount for claiming a puzzle piece per level
/// @return uint256 Minimum claim amount
function getMinClaimAmount(uint256 _level) public view returns (uint256) {}

/// @notice Returns the URI of the specified collection ID
/// @return string URI where NFT metadata is stored
function uri(uint256 _tokenID) external view returns (string memory) {}

```

**Entities**

```solidity
/// @notice The address of the Access Control contract.
/// @dev This value is set at the time of contract deployment.
address public immutable SLPERMISSIONS_ADDRESS;

/// @notice The address of the Investment factory.
/// @dev This value is set at the time of contract deployment.
address public factoryAddress;

/// @notice The address of the payment token.
/// @dev This value is set at the time of contract deployment.
address public paymentTokenAddress;

/// @notice Uint to store minimum claim amount for all levels and the current entry price
/// @dev This value is set at the time of contract deployment. Entry price changes in time
uint256 public min_claim_amount_and_entry_price = 100150001000005000;

/// @notice Base uri for 0 -> 31 tokens
/// @dev This value is set at the time of contract deployment.
string public constant URI = "INSERT_HERE";

/// @notice URI for each entry batch
/// @dev This value is set at the time of batch creation.
string[] public batches_uri;

```

**Errors**

```solidity
/// @notice Reverts if a certain address == address(0)
/// @param reason which address is missing
error InvalidAddress(string reason);

/// @notice Reverts if input is not in level range
/// @param input level inputed
/// @param min minimum level value
/// @param max maximum level value
error InvalidLevel(uint256 input, uint256 min, uint256 max);

/// @notice Reverts if input is not in level range
/// @param level level of the pieces
/// @param currentPieces current number of pieces
/// @param maxPieces pieces limit
error PiecesLimit(uint256 level, uint256 currentPieces, uint256 maxPieces);

/// @notice Reverts if input is not in level range
/// @param allowedPieces number of allowed pieces to claim by the user
/// @param currentPieces number of claimed pieces
error MissingInvestmentToClaim(
    uint256 allowedPieces,
    uint256 currentPieces
);

/// Function caller is not CFO level
error NotCFO();

/// Function caller is not an allowed contract
error NotAllowedContract();

```

**Modifiers**

```solidity
/// @notice Verifies if the caller is an allowed contract.
/// @dev Allowed contracts have the right to interact with: payEntryFee() and setEntryPrice()
modifier isAllowedContract() {}

/// @notice Verifies if the user is a CFO.
/// @dev CFO has the right to interact with: withdrawTokens()
modifier isCFO() {}

```

**Functions**

```solidity
/// @notice Allow the CFO of the contract to withdraw tokens from the contract's account
/// @dev Can only be called by the CFO of the contract
/// @param _user The address of the user
function withdrawTokens(address _user) external isCFO {}

/// @notice Transfer the entry fee from the user's account to the contract's account
/// @dev Uses the ERC20 `transferFrom` function
/// @param _user The address of the user
function payEntryFee(address _user) external isAllowedContract nonReentrant {}

/// @notice Set the entry price for a new entry batch
/// @dev This function can only be called by one of the allowed contracts
/// @param _newPrice The price for the new entry batch
/// @param _tokenURI The URI for the new entry batch
function setEntryPrice(
    uint256 _newPrice,
    string memory _tokenURI
) external isAllowedContract {}

/// @notice Check if a user is allowed to claim a puzzle piece
/// @dev Takes into account the user's current level and the number of puzzle pieces they have for their current level
/// @param _user The address of the user
/// @param _tokenId The ID of the token
/// @param _currentUserLevel The current level of the user
/// @param _userPuzzlePiecesForUserCurrentLevel The number of puzzle pieces the user has for their current level
/// @return A boolean indicating whether the user is allowed to claim the puzzle piece
function userAllowedToClaimPiece(
    address _user,
    uint256 _tokenId,
    uint256 _currentUserLevel,
    uint256 _userPuzzlePiecesForUserCurrentLevel
) public view returns (bool) {}

```

**SLBase.sol**

SLBase is the 2nd contract from the  inheritance schema.

- Centralizes information on this contract, making sure that all of the ERC1155 communications and memory writting calls happens through here
- Implements core functions and instantiates unimplemented functions for later contracts in the line to implement
- Here is where all the information of the SLCore schema is stored.

**Contract Deployment :**

1. This contract should not be deployed by itself, it should rather be imported by the next contract in the list, SLLevels.

**Logic for claiming a piece/level**

1. This functions cannot be called, they are called later by user callable function.
2. This action happens through:

```solidity
/// @notice Function that calls the necessary functions to try to pass the user to the next level.
/// @dev Puzzle tokens required to pass the level are burned during the transaction.
/// @param _receiver The receiver of the level (the user).
/// @param _tokenId The collection ID that the user wants to mint from.
/// @custom:requires _tokenId should be 30 (level 2) or 31 (level 3).
function _claimLevel(address _receiver, uint256 _tokenId) internal {}

/// @notice Function that calls the necessary functions to try to mint a puzzle piece for the user.
/// @dev User must be in the same level as the piece they are minting.
/// @param _receiver The receiver of the puzzle piece (the user).
/// @param _puzzleLevel The level from which the user wants to mint the puzzle piece.
function _claimPiece(address _receiver, uint256 _puzzleLevel) internal {}

```

**Incrementing a puzzle piece after claim**

1. In conjunction with SLMicroSlots.sol, when a user claim a piece, the information needs to be updated, thus calling:

```solidity
/// @notice Increments by 1 the number of user puzzle pieces in a specified level
/// @dev Uses SLMicroSlots to write in a variable in such format "333222111"
/// (where 333 -> Nº of LVL3 pieces, 222 -> Nº of LVL2 pieces, 111 -> Nº of LVL1 pieces)
/// @param _user User's address
/// @param _puzzleLevel Level in which we want to increment the amount by 1
function _incrementUserPuzzlePieces(address _user, uint256 _puzzleLevel) internal {}

```

,then:

```solidity

/// @notice Function to mint tokens on claim
/// @param _receiver User's address
/// @param _tokenId The ID of the collection from which the NFT should be minted
/// @param _quantity Quantity to mint
function _transferTokensOnClaim(address _receiver, uint256 _tokenId, uint256 _quantity) internal {}

```

**To be overridden function**

1. Each of this functions has a purpose that will only be implemented down in the line of inheritance, by the responsible contract.

```solidity
/// @notice Verifies if the user can claim a given piece or level NFT
/// @dev Override the verify claim function to check if the user has the right to claim the next level or puzzle piece
/// @param _claimer The user's address
/// @param _tokenIdOrPuzzleLevel The token ID of the level (30 or 31) or the level of the piece (1, 2, 3)
function verifyClaim(address _claimer, uint256 _tokenIdOrPuzzleLevel) public view virtual {}

/// @notice Returns a random number
function _random() public view virtual returns (uint8) {}

/// @notice Function that defines which piece is going to be minted
/// @dev Override to implement puzzle piece claiming logic
/// @param _receiver The user's address
/// @param _puzzleLevel The level of the piece (1, 2, 3)
/// @return _collectionToMint The collection from which the piece is going to be minted
function _dealWithPuzzleClaiming(address _receiver, uint256 _puzzleLevel) internal virtual returns (uint8 _collectionToMint) {}

/// @notice Function that verifies if the user is allowed to pass to the next level
/// @dev Function has no return, it should fail if the user is not allowed to burn
/// @param _claimer The user's address
/// @param _levelId The ID of the piece's level (level 2 -> 30, level 3 -> 31)
function _userAllowedToBurnPuzzle(address _claimer, uint256 _levelId) public view virtual {}

/// @notice Function that returns the level token IDs
/// @dev Should be overridden
/// @param level The level for which we want the token IDs
/// @return uint256[] memory with IDs for level 2 and 3 (30, 31) or all level 1 collection IDs
function _getLevelTokenIds(uint256 level) internal view virtual returns (uint256[] memory) {}

/// @notice Function that returns the puzzle pieces for a specified level
/// @dev Should be overridden
/// @param level The level for which we want the token IDs
/// @return uint256[] memory with 10 IDs for 10 pieces
function _getPuzzleCollectionIds(uint256 level) public view virtual returns (uint256[] memory) {}

```

**Getter functions**

Additionally, there are different getter functions, that can be called to
retrieve relevant data from the contract:

```solidity
/// @notice Function that returns the token IDs for a given level
/// @dev Should be overridden
/// @param level The level for which we want the token IDs
/// @return uint256[] memory with token IDs
function _getLevelTokenIds(uint256 level) internal view virtual returns (uint256[] memory) {}

/// @notice Function that returns the puzzle pieces for a specified level
/// @dev Should be overridden
/// @param level The level for which we want the token IDs
/// @return uint256[] memory with 10 IDs for 10 pieces
function _getPuzzleCollectionIds(uint256 level) public view virtual returns (uint256[] memory) {}

/// @notice Function to create a user address array with the given size
/// @param _user The user for whom the array is created
/// @param _size The size of the new array
/// @return uint256[] memory with size slots of user addresses
function _createUserAddressArray(address _user, uint256 _size) internal pure returns (address[] memory) {}

```

**Entities**

```solidity
/// @notice Array to store the levels and puzzles collection IDs
/// @dev Each ID is stored in 2 slots of the variable. Ex: IDs {00, 01, 02, ..., 30, 31}
uint256 public constant COLLECTION_IDS =
		3130292827262524232221201918171615141312111009080706050403020100;

/// @notice Array to store the entry batches' IDs
/// @dev Key: Entry batch number, returns enough to compute TokenID, max rotation, and current token ID.
uint24[] public entryIdsArray;

/// @notice Mapping to track the number of user puzzle pieces
/// @dev Key: User address, returns user puzzle pieces for all levels (separated the same way as COLLECTION_IDS).
mapping(address => uint32) public userPuzzlePieces;

/// @notice The address of SLLogics contract.
/// @dev This value is set at the time of contract deployment.
address public slLogicsAddress;

/// @notice The address of Access control contract.
/// @dev This value is set at the time of contract deployment.
address public slPermissionsAddress;

```

**Errors**

```solidity
/// @notice Reverts if a certain address == address(0)
/// @param reason which address is missing
error InvalidAddress(string reason);

/// @notice Reverts if input is not in level range
/// @param input level inputed
/// @param min minimum level value
/// @param max maximum level value
error InvalidLevel(uint256 input, uint256 min, uint256 max);

/// @notice Reverts if user is not at least at contract level
/// @param expectedLevel expected user minimum level
/// @param userLevel user level
error IncorrectUserLevel(uint256 expectedLevel, uint256 userLevel);

/// @notice Reverts if user don't have the complete puzzle
/// @param level level of the required puzzle
error UserMustHaveCompletePuzzle(uint256 level);

/// @notice Reverts if there is no entry batch
error InexistentEntryBatch();

/// @notice Reverts if there are no tokens remaining on the current entry batch
error NoTokensRemaining();

/// @notice Reverts if the platform is paused
error PlatformPaused();

/// @notice Reverts if entry minting is paused
error EntryMintPaused();

/// @notice Reverts if claiming is paused
error ClaimingPaused();

/// @notice Reverts if the function caller is not the CEO
error NotCEO();

```

**Events**

```solidity
/// @notice An event that is emitted when a user mint a level or a piece NFT.
/// @param claimer The address of said user.
/// @param tokenId The id of the collection minted from.
event TokensClaimed(address indexed claimer, uint256 indexed tokenId);

```

**Modifiers**

```solidity
/// @notice Verifies if user is CEO.
/// @dev CEO has the right to interact with certain functions
modifier isCEO() {
    if (!ISLPermissions(slPermissionsAddress).isCEO(msg.sender)) {
        revert NotCEO();
    }
    _;
}

/// @notice Verifies if entry minting is not paused.
/// @dev If it is paused, the only available actions are claimLevel() and claimPiece()
modifier isEntryMintNotPaused() {
    if (ISLPermissions(slPermissionsAddress).isEntryMintPaused()) {
        revert EntryMintPaused();
    }
    _;
}

/// @notice Verifies if puzzle and level 2 and 3 minting is stopped.
/// @dev If it is paused, the only action available is mintEntry()
modifier isPuzzleMintNotPaused() {
    if (ISLPermissions(slPermissionsAddress).isClaimPaused()) {
        revert ClaimingPaused();
    }
    _;
}

/// @notice Verifies if the platform is paused.
/// @dev If the platform is paused, the whole contract is stopped
modifier isNotGloballyStopped() {
    if (ISLPermissions(slPermissionsAddress).isPlatformPaused()) {
        revert PlatformPaused();
    }
    _;
}

```

**Functions**

```solidity
/// @notice Verifies if user can claim given piece or level NFT
/// @dev Override the verify claim function to check if the user has the right to claim the next level or puzzle piece
/// @param _claimer the user's address
/// @param _tokenIdOrPuzzleLevel The token id of the level (30 or 30) or level of the piece (1,2,3)
function verifyClaim(
    address _claimer,
    uint256 _tokenIdOrPuzzleLevel
) public view virtual {}

/// @notice returns random number
function _random() public view virtual returns (uint8) {}

/// @notice Function that verifies if user is allowed to pass to the next level
/// @dev function has no return, it should fail if the user is not allowed to burn
/// @param _claimer the user's address
/// @param _levelId The id of the piece's level (level 2->30, level 3->31)
function _userAllowedToBurnPuzzle(
    address _claimer,
    uint256 _levelId
) public view virtual {}

/// @notice Auxiliary function to burn user puzzle depending on his level
/// @dev burns in batch to be gas wiser
/// @param _user the user's address
/// @param _levelId The id of the piece's level (level 2->30, level 3->31)
function _dealWithPuzzleBurning(address _user, uint256 _levelId) private {}

/// @notice Function that defines which piece is going to be minted
/// @dev Override to implement puzzle piece claiming logic
/// @param _receiver the user's address
/// @param _puzzleLevel The level of the piece (1,2,3)
/// @return _collectionToMint the collection from which the piece is going to be minted
function _dealWithPuzzleClaiming(
    address _receiver,
    uint256 _puzzleLevel
) internal virtual returns (uint8 _collectionToMint) {}

/// @notice Increments by 1 the number of user puzzle pieces in a specified level
/// @dev Uses SLMicroSlots to write in a variable in such format "333222111"
/// (where 333 -> Nº of LVL3 pieces, 222 -> Nº of LVL2 pieces, 111 -> Nº of LVL1 pieces)
/// @param _user user's address
/// @param _puzzleLevel level in which we want to increment the amount by 1
function _incrementUserPuzzlePieces(
    address _user,
    uint256 _puzzleLevel
) internal {}

/// @notice function to mint tokens on claim
/// @param _receiver user's address
/// @param _tokenId the id of the collection from which the NFT should be minted
/// @param _quantity quantity to mint
function _transferTokensOnClaim(
    address _receiver,
    uint256 _tokenId,
    uint256 _quantity
) internal {}

/// @notice function call the necessary functions to try to pass the user to the next one
/// @dev puzzle tokens required to pass the level are burned during the transaction
/// @param _receiver the receiver of the level (the user).
/// @param _tokenId the collection id that the user wants to mint from
/// @custom:requires _tokenId should be 30 (level 2) or 31 (level 3)
function _claimLevel(address _receiver, uint256 _tokenId) internal {}

/// @notice function call the necessary functions to try to mint a puzzle piece for the user
/// @dev user must be in the same level as the piece he's minting
/// @param _receiver the receiver of the puzzle piece (the user).
/// @param _puzzleLevel the level from which the user wants to mint the puzzle from
function _claimPiece(address _receiver, uint256 _puzzleLevel) internal {}

```

**SLLevels.sol**

SLLevels is the 3rd contract from the  inheritance schema.

- Every level related function is implemented here, also the modifiers and getters
- no function can be called externally outside another later created in the schema
- Doesn’t store info.

**Contract Deployment :**

1. This contract should not be deployed by itself, it should rather be imported by the next contract in the list, SLPuzzles.

**Logic for buying a membership card**

1. This functions cannot be called, they are called later by user callable function.
2. This action happens through:

```solidity
/// @notice Function to deal with data of buying a new NFT entry token
/// @dev Call the function and add needed logic (Payment, etc)
/// @param _receiver buyer
function _buyEntryToken(address _receiver) internal {
    // Verify if the entry token batch exists
    if (entryIdsArray.length == 0) {
        revert InexistentEntryBatch();
    }

    // Verify if the entry token is still available
    if (getCurrentEntryBatchRemainingTokens() == 0) {
        revert NoTokensRemaining();
    }

    // Get the current entry batch number
    uint256 batch = entryIdsArray.length - 1;

    // Get the entry token cap and currentID
    (
        uint256 entryTokenCap,
        uint256 entryTokenCurrentId
    ) = unmountEntryValue(entryIdsArray[batch]);

    // Increment the entry token current id
    entryIdsArray[batch] = mountEntryValue(
        entryTokenCap,
        entryTokenCurrentId + 1
    );

    // Mint the entry token to the user
    _transferTokensOnClaim(
        _receiver,
        mountEntryID(batch, entryTokenCap),
        1
    );

    emit TokensClaimed(_receiver, mountEntryID(batch, entryTokenCap));
}

```

**Overridden functions**

```solidity
/// Added logic that verifies the possibility of passing the level
/// @inheritdoc	SLBase
function _userAllowedToBurnPuzzle(
    address _claimer,
    uint256 _tokenId
) public view override {
    // Helper Arrays
    uint256 arraysLength = 10;
    address[] memory userAddress = _createUserAddressArray(
        _claimer,
        arraysLength
    );
    uint256[] memory amountsForBurn = new uint256[](arraysLength);
    uint256[] memory balance;

    // Fill needed arrays
    for (uint256 i; i < arraysLength; ++i) {
        amountsForBurn[i] = 1;
    }

    // Puzzle verification for passing to level2
    if (_tokenId == 30) {
        // Check for user level token ownership
        if (balanceOf(_claimer, _tokenId) != 0) {
            revert IncorrectUserLevel(1, 2);
        }

        // Get balance of the user
        balance = balanceOfBatch(userAddress, _getPuzzleCollectionIds(1));

        // Verify if balance meets the condition
        uint256 balanceLength = balance.length;
        for (uint256 i; i < balanceLength; ++i) {
            if (balance[i] == 0) {
                revert UserMustHaveCompletePuzzle(1);
            }
        }
    }
    // Puzzle verification for passing to level3
    else if (_tokenId == 31) {
        // Check for user level token ownership
        if (balanceOf(_claimer, _tokenId) != 0) {
            revert IncorrectUserLevel(2, 3);
        }

        // Get balance of the user
        balance = balanceOfBatch(userAddress, _getPuzzleCollectionIds(2));

        // Verify if balance meets the condition
        uint256 balanceLength = balance.length;
        for (uint256 i; i < balanceLength; ++i) {
            if (balance[i] == 0) {
                revert UserMustHaveCompletePuzzle(2);
            }
        }
    } else {
        // Revert if the ID is not Level2 or 3 ID
        revert("Not a valid level token ID");
    }
}

/// @inheritdoc	SLBase
function _getLevelTokenIds(
    uint256 _level
) internal view override returns (uint256[] memory) {
    if (_level == 1) {
        uint256 arrayLenght = entryIdsArray.length;
        uint256[] memory entryTokenIds = new uint256[](arrayLenght);
        for (uint256 i; i < arrayLenght; ++i) {
            // i is the batch number
            // get the entry token cap to mount the entry token id
            (uint256 entryTokenCap, ) = unmountEntryValue(entryIdsArray[i]);
            entryTokenIds[i] = mountEntryID(i, entryTokenCap);
        }
        return entryTokenIds;
    } else if (_level == 2 || _level == 3) {
        uint256[] memory level2And3Ids = new uint256[](2);
        level2And3Ids[0] = 30;
        level2And3Ids[1] = 31;
        return level2And3Ids;
    }
}

```

**Getter functions**

Additionally, there are different getter functions, that can be called to
retrieve relevant data from the contract:

```solidity
/// @notice Get the remaining tokens for the current batch
/// @dev Uses SLMicroSlots to have access to such information
/// @return uint256 representing the remaining tokens
function getCurrentEntryBatchRemainingTokens() public view returns (uint256) {}

```

**Modifiers**

```solidity
/// @notice Verifies if the user has the necessary NFT to interact with the function.
/// @dev User should be at least the same level as required by the function
/// @param _level The required NFT level
modifier userHasLevel(uint256 _level) {}

```

**Functions**

```solidity
/// @notice Get remaining tokens for the current batch
/// @dev Uses SLMicroSlots to have access to such information
/// @return uint256 tokens left
function getCurrentEntryBatchRemainingTokens() public view returns (uint256) {}

/// @notice Check user's level
/// @dev Checks based on NFT balance, allowing users to trade privileges
/// @param _user User's address
/// @return uint256 User's level
function whichLevelUserHas(address _user) external view returns (uint256) {}

/// @notice Check user's level
/// @dev Checks based on NFT balance, allowing users to trade privileges
/// @param _user User's address
/// @return uint256 User's level
function _whichLevelUserHas(address _user) internal view returns (uint256) {}

/// @notice Function to deal with data of buying a new NFT entry token
/// @dev Call the function and add needed logic (Payment, etc)
/// @param _receiver Buyer
function _buyEntryToken(address _receiver) internal {}

```

**SLPuzzles.sol**

SLPuzzles is the 4th contract from the inheritance schema.

- Every piece related function is implemented here, also the modifiers and getters
- no function can be called externally outside another later created in the schema
- Doesn’t store info.

**Contract Deployment :**

1. This contract should not be deployed by itself, it should rather be imported by the next contract in the list, SLPuzzles.

**Logic for verifying the ability to claim a piece or a level**

1. Here the code decides if it is a piece of a level the user is claiming.
2. In the case of a level it will redirect to the function instantiated in SLLevels.sol to do the verification
3. In case of a puzzle piece it will compute the user level and call SLLogics.sol to verify the user ability to claim
4. This action happens through:

```solidity
/// Added computation of the user level so the user doesn't input his level when claiming
/// @inheritdoc SLBase
function verifyClaim(
    address _claimer,
    uint256 _tokenIdOrPuzzleLevel
) public view override {}

```

**Overridden functions**

```solidity
/// Added computation of the user level so the user doesn't input his level when claiming
/// @inheritdoc SLBase
function verifyClaim(
    address _claimer,
    uint256 _tokenIdOrPuzzleLevel
) public view override {
    // Check if the given piece is a puzzle piece or a level
    if (_tokenIdOrPuzzleLevel == 31 || _tokenIdOrPuzzleLevel == 30) {
        // Check if the user has the ability to burn the puzzle piece
        _userAllowedToBurnPuzzle(_claimer, _tokenIdOrPuzzleLevel);
    } else if (
        _tokenIdOrPuzzleLevel == 1 ||
        _tokenIdOrPuzzleLevel == 2 ||
        _tokenIdOrPuzzleLevel == 3
    ) {
        // Check if the user has the ability to claim the puzzle piece
        ISLLogics(slLogicsAddress)._userAllowedToClaimPiece(
            _claimer,
            _tokenIdOrPuzzleLevel,
            _whichLevelUserHas(_claimer),
            getUserPuzzlePiecesForUserCurrentLevel(
                _claimer,
                _whichLevelUserHas(_claimer)
            )
        );
    } else {
        revert("Not a valid id");
    }
}

/// @inheritdoc SLBase
function _random() public view override returns (uint8) {
    return
        uint8(
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.difficulty,
                        msg.sender
                    )
                )
            ) % 10
        );
}

/// @inheritdoc SLBase
function _getPuzzleCollectionIds(uint256 level)
    public
    view
    override
    returns (uint256[] memory)
{
    uint256[] memory ids = new uint256[](10);
    if (level == 1) {
        ids = getMultiplePositionsXInDivisionByY(COLLECTION_IDS, 1, 10, 2);
    } else if (level == 2) {
        ids = getMultiplePositionsXInDivisionByY(COLLECTION_IDS, 11, 10, 2);
    } else if (level == 3) {
        ids = getMultiplePositionsXInDivisionByY(COLLECTION_IDS, 21, 10, 2);
    } else {
        revert("Not a valid puzzle level");
    }
    return ids;
}

/// @inheritdoc SLBase
function _dealWithPuzzleClaiming(address _receiver, uint256 _puzzleLevel)
    internal
    override
    returns (uint8 _collectionToMint)
{
    // Assuming the user passed verifyClaim
    _incrementUserPuzzlePieces(_receiver, _puzzleLevel);
    // Return the collection to mint
    return uint8(_getPuzzleCollectionIds(_puzzleLevel)[_random()]);
}

```

**Getter functions**

Additionally, there are different getter functions, that can be called to
retrieve relevant data from the contract:

```solidity
// Function to get how many puzzle pieces a user has from the current level
/// @notice Function to get how many puzzle pieces a user has from the current level
/// @dev If a user is given a piece by transfer, it will not count as a claimed piece
/// @param _user user's address
/// @param level the specified level
/// @return uint256 number of pieces
function getUserPuzzlePiecesForUserCurrentLevel(
    address _user,
    uint256 level
) public view returns (uint256) {}

```

**Functions (Same as Overridden)**

```solidity
/// Added computation of the user level so the user doesn't input his level when claiming
/// @inheritdoc SLBase
function verifyClaim(
    address _claimer,
    uint256 _tokenIdOrPuzzleLevel
) public view override {}

/// @inheritdoc SLBase
function _random() public view override returns (uint8) {}

/// @inheritdoc SLBase
function _getPuzzleCollectionIds(uint256 level)
    public
    view
    override
    returns (uint256[] memory)
{}

/// @inheritdoc SLBase
function _dealWithPuzzleClaiming(address _receiver, uint256 _puzzleLevel)
    internal
    override
    returns (uint8 _collectionToMint)
{}

```

**SLCore.sol**

SLCore is the 5th contract from the inheritance schema.

- Every user interactable function is implemented here.
- Doesn’t store info.

**Contract Deployment :**

1. For the deployment of this contract, a valid SLLogics and SLPermissions address must be passed
2. This contract initiates the whole schema

```solidity
/// @notice Initializes the new SLCore contract.
/// @param _slLogicsAddress The address of the SLLogics contract.
/// @param _slPermissionsAddress The address of the SLPermissions contract.
constructor(address _slLogicsAddress, address _slPermissionsAddress) {
    if (_slLogicsAddress == address(0)) {
        revert InvalidAddress("SLLogics");
    }
    if (_slPermissionsAddress == address(0)) {
        revert InvalidAddress("SLPermissions");
    }

    slLogicsAddress = _slLogicsAddress;
    slPermissionsAddress = _slPermissionsAddress;
}

```

**Mint a membership card**

1. Only a user that doesn’t have a membership card can mint one.
2. The approval call in the ERC20 token used must be done to SLLogics since it’s going to be the contract receiving the payment.
3. This function can be externally paused by SLPermissions.sol
4. This action happens through:

```solidity
/// @notice Mints an entry token for the caller.
/// @dev This function can only be called when entry minting is not paused and by non-reentrant calls.
function mintEntry() public isEntryMintNotPaused nonReentrant {}

```

**Mint a puzzle piece nft**

1. Only a user that has a membership card can mint puzzle pieces nfts.
2. Each puzzle piece requires X investment to be claimed:
    1. Level 1: 5000$ per piece
    2. Level 2: 10000$ per piece
    3. Level 3: 15000$ per piece
3. The contract computes the user level, meaning the user can only mint puzzle pieces from the level he/she is one.
4. This function can be externally paused by SLPermissions.sol
5. This action happens through:

```solidity
/// @notice Claims a puzzle piece for the caller.
/// @dev This function can only be called when puzzle minting is not paused, by non-reentrant calls, and by users of at least level 1.
function claimPiece() public isPuzzleMintNotPaused nonReentrant userHasLevel(1) {}

```

**Mint a level nft**

1. Only a user that has a membership card can mint level nfts.
2. Each level requires 10 unique pieces from the previous level:
    1. Reach/mint level 2 NFT: 10 unique level 1 puzzle pieces
    2. Reach/mint level 3 NFT: 10 unique level 2 puzzle pieces
    3. Reach/mint level 3 completion NFT : 10 unique level 3 puzzle pieces
3. The contract computes the user level, meaning the user can only mint the level he/she is one.
4. This function can be externally paused by SLPermissions.sol
5. This action happens through:

```solidity
/// @notice Claims a level for the caller.
/// @dev This function can only be called when puzzle minting is not paused, by non-reentrant calls, and by users of at least level 1.
function claimLevel() public isPuzzleMintNotPaused nonReentrant userHasLevel(1) {}

```

**Generate a new membership card batch**

1. Only the CEO is allowed to generate membership card batches.
2. To create a new batch the CEO needs to send a valid:
    1. batch cap - the total amount of membership cards in the collection
    2. price - the price for each nft of the collection
    3. token uri - the uri for the collection of membership cards containing the url of the image and some stats
3. This function can be externally paused by SLPermissions.sol
4. This action happens through:

```solidity
/// @notice Generates a new entry batch.
/// @dev This function can only be called by the CEO and when the system is not globally stopped.
/// @param _cap The cap for the new entry batch.
/// @param _entryPrice The price for the new entry batch.
/// @param _tokenUri The URI for the new entry batch.
function generateNewEntryBatch(
    uint256 _cap,
    uint256 _entryPrice,
    string memory _tokenUri
) public isNotGloballyStopped isCEO {}

```

**Overridden functions**

```solidity
/// @notice Returns the URI for a given token ID.
/// @param _collectionId The ID of the token to retrieve the URI for.
/// @return The URI of the given token ID.
function uri(uint256 _collectionId) public view override returns (string memory) {
    return ISLLogics(slLogicsAddress).uri(_collectionId);
}

```

**Testing functions**

Additionally, due to the random functionality, there’s a function to be added in testing purposes, that guarantees the claim of 10 unique pieces of each level, to test level related features.:

```solidity
function mintTest(uint256 level) public {
    require(level >= 1 && level <= 3, "Invalid level");

    uint256[] memory collectionIds = _getPuzzleCollectionIds(level);

    require(collectionIds.length >= 10, "Insufficient collection IDs for this level");

    for (uint i = 0; i < 10; i++) {
        _mint(msg.sender, collectionIds[i], 1, "");
        _incrementUserPuzzlePieces(msg.sender, level);
    }
}

```

**Functions**

```solidity
// Mints an entry token for the caller.
// This function can only be called when entry minting is not paused and by non-reentrant calls.
function mintEntry() public isEntryMintNotPaused nonReentrant {
    if (_whichLevelUserHas(msg.sender) != 0) {
        revert IncorrectUserLevel(_whichLevelUserHas(msg.sender), 0);
    }
    // Run internal logic to mint entry token
    _buyEntryToken(msg.sender);
    // Initialize token and ask for payment
    ISLLogics(slLogicsAddress).payEntryFee(msg.sender);
}

// Claims a puzzle piece for the caller.
// This function can only be called when puzzle minting is not paused, by non-reentrant calls, and by users of at least level 1.
function claimPiece() public isPuzzleMintNotPaused nonReentrant userHasLevel(1) {
    // Claim the piece for the user
    _claimPiece(msg.sender, _whichLevelUserHas(msg.sender));
}

// Claims a level for the caller.
// This function can only be called when puzzle minting is not paused, by non-reentrant calls, and by users of at least level 1.
function claimLevel() public isPuzzleMintNotPaused nonReentrant userHasLevel(1) {
    // Check if the user has the highest level
    if (_whichLevelUserHas(msg.sender) > 2) {
        revert IncorrectUserLevel(_whichLevelUserHas(msg.sender), 2);
    }

    // Claim the next level for the user depending on the level they have
    _claimLevel(msg.sender, _whichLevelUserHas(msg.sender) == 1 ? 30 : 31);
}

// Generates a new entry batch.
// This function can only be called by the CEO and when the system is not globally stopped.
function generateNewEntryBatch(uint256 _cap, uint256 _entryPrice, string memory _tokenUri) public isNotGloballyStoped isCEO {
    entryIdsArray.push(mountEntryValue(_cap, 0));
    ISLLogics(slLogicsAddress).setEntryPrice(_entryPrice, _tokenUri);
}

```

<!-- TOC --><a name="getting-started-"></a>
## Getting started 🚀

Here is a step-by-step guide on how to run the Something Legendary environment on your local machine.

<!-- TOC --><a name="prerequisites-"></a>
### **Prerequisites 💺**

Before you begin, make sure you have [Yarn](https://yarnpkg.com/) and **`git`** installed on your system. If you don't have Yarn installed, you can download and install it from the [official website](https://yarnpkg.com/). You can install **`git`** from the [official website](https://git-scm.com/downloads).

<!-- TOC --><a name="clone-the-repository-"></a>
### **Clone the Repository ㊢**

1. Open your terminal or command prompt.
2. Navigate to the directory where you want to clone the project.
3. After cloning, move to that directory.
4. Run the following command to clone the repository, and move to the next directory:

```bash
git clone <https://github.com/Web360Labs/SomethingLegendary-Smartcontracts.git>
cd SomethingLegendary-Smartcontracts

```

<!-- TOC --><a name="install-dependencies-"></a>
### **Install Dependencies 🧑‍🔧**

1. In the project directory, run the following command to install the project's dependencies using Yarn:

```bash
yarn install

```

Yarn will fetch and install all the necessary packages and libraries listed in the **`package.json`** file. This may take a moment to complete.

<!-- TOC --><a name="update-the-env-file-"></a>
### Update the .env file 🚑

The variables are later use in the code, so to have the full experience, feel the .envExample and remove the “Example” part.

- Alchemy - https://www.alchemy.com/
- Private key - your development wallet private key.
- Etherscan - https://docs.etherscan.io/getting-started/viewing-api-usage-statistics

```solidity
ALCHEMY_API_KEY_URL=
PRIVATE_KEY=
ETHERSCAN_API_KEY=

```

<!-- TOC --><a name="run-the-project-"></a>
### **Run the Project 🔥**

Now that you've cloned the repository and installed the dependencies, you're ready to run the project. Depending on the specifics of your project, provide instructions for starting or running your project's development environment or scripts.

<!-- TOC --><a name="smart-contract-scripts-"></a>
## Smart Contract Scripts 💻

This repository contains a set of Hardhat scripts for deploying and interacting with Ethereum smart contracts. Below is a list of available scripts and their explanations.

<!-- TOC --><a name="deploy-smart-contract-localhost-"></a>
### Deploy Smart Contract (Localhost) 🚓

- **Script Name:** `deploy`
- **Description:** This script deploys the smart contracts on a local Ethereum network for testing and development purposes.

<!-- TOC --><a name="deploy-smart-contract-mumbai-testnet-"></a>
### Deploy Smart Contract (Mumbai Testnet)  🚲

- **Script Name:** `deployt`
- **Description:** This script deploys the smart contracts on the Mumbai testnet, a test network for Polygon (formerly Matic).

<!-- TOC --><a name="mint-tokens-localhost-"></a>
### Mint Tokens (Localhost) 🥺

- **Script Name:** `mint`
- **Description:** This script is used to mint the membership card.

<!-- TOC --><a name="mint-payment-token-localhost-"></a>
### Mint Payment Token (Localhost) 💰

- **Script Name:** `mintPT`
- **Description:** This script is used to mint payment tokens on a local Ethereum network.

<!-- TOC --><a name="mint-puzzle-token-localhost-"></a>
### Mint Puzzle Token (Localhost) 🧩

- **Script Name:** `mintPuzzle`
- **Description:** This script is used to mint puzzle tokens on a local Ethereum network. It will give the 10 unique puzzle pieces nfts from level 1.

<!-- TOC --><a name="mint-puzzle-token-level-2-localhost-"></a>
### Mint Puzzle Token Level 2 (Localhost) 🧩

- **Script Name:** `mintPuzzlel2`
- **Description:** This script is used to mint puzzle tokens on a local Ethereum network. It will give the 10 unique puzzle pieces nfts from level 2.

<!-- TOC --><a name="invest-localhost-"></a>
### Invest (Localhost) 🤑

- **Script Name:** `invest`
- **Description:** This script allows for investment, typically with a value of 2500, on a local Ethereum network.

<!-- TOC --><a name="invest-5k-with-level-1-contract-localhost-"></a>
### Invest 5k with Level 1 Contract (Localhost) 🤑💰

- **Script Name:** `invest5kl1`
- **Description:** This script allows for a 5,000 investment in a level 1 car on a local Ethereum network. This scripts deploys a Level 1 contract each time it runs.

<!-- TOC --><a name="invest-10k-with-level-2-access-localhost"></a>
### Invest 10k with Level 2 Access (Localhost)💰💰

- **Script Name:** `invest10kl2`
- **Description:** This script allows for a 10,000 investment in a level 2 car on a Ethereum network. This scripts deploys a Level 2 contract each time it runs.

<!-- TOC --><a name="invest-15k-with-level-3-access-localhost"></a>
### Invest 15k with Level 3 Access (Localhost)💰🤑💰

- **Script Name:** `invest15kl3`
- **Description:** This script allows for a 15,000 iinvestment in a level 3 car on a local Ethereum network. This scripts deploys a Level 3 contract each time it runs.

<!-- TOC --><a name="deploy-investment-contract-localhost-"></a>
### Deploy Investment Contract (Localhost) 🕊

- **Script Name:** `deployInvest`
- **Description:** This script deploys an investment contract on a local Ethereum network. The investment will be level 1

<!-- TOC --><a name="compile-contracts-"></a>
### Compile Contracts 📚

- **Script Name:** `compile`
- **Description:** This script is used to clean and compile the smart contracts.

<!-- TOC --><a name="start-local-hardhat-node-"></a>
### Start Local Hardhat Node 🕸

- **Script Name:** `bc`
- **Description:** This script starts a local Hardhat node for local development and testing.

Please note that script names ending with `t` often indicate they are used on a testnet, while those without `t` are used for local development.

Make sure to run these scripts in the respective network environment to perform the described actions.