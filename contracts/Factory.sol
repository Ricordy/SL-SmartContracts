// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Investment.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title SLFactory
/// @author Something Legendary
/// @notice This contract is responsible for deploying new Investment contracts and managing them.
/// @dev This contract uses an external contract for access control (SLPERMISSIONS_ADDRESS) and requires a valid SLCore address to initialize Investment contracts.
contract Factory {
    /// @notice A mapping that stores deployed Investment contracts by their level.
    /// @dev The key is the level of the Investment contract and the value is an array of Investment contracts at that level.
    mapping(uint => Investment[]) public deployedContracts;
    /// @notice Stores SLCore address
    /// @dev Used to initialize Investment contracts
    address slCoreAddress;
    /// @notice Stores SLPermissions address
    /// @dev Used to Control Access to certain functions
    address public immutable SLPERMISSIONS_ADDRESS;

    /// @notice An event that is emitted when a new Investment contract is deployed.
    /// @param ContractID The ID of the new contract in its level.
    /// @param conAddress The address of the new contract.
    /// @param conLevel The level of the new contract.
    event ContractCreated(
        uint256 indexed ContractID,
        address indexed conAddress,
        uint indexed conLevel
    );

    /// @notice Initializes the contract with the address of the SLPermissions contract.
    /// @param _slPermissionsAddress The address of the SLPermissions contract.
    constructor(address _slPermissionsAddress) {
        SLPERMISSIONS_ADDRESS = _slPermissionsAddress;
    }

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
        uint8 _level
    ) external isCEO isNotGloballyStoped returns (address) {
        require(
            slCoreAddress != address(0),
            "Factory: First provide the entry contract address"
        );
        require(
            _paymentTokenAddress != address(0),
            "Factory: Provide a real paymentTokenAddress"
        );
        require(_level > 0 && _level < 4, "Factory: Provide an existing level");

        //Generate new Investment contract
        Investment inv = new Investment(
            _totalInvestment,
            SLPERMISSIONS_ADDRESS,
            slCoreAddress,
            _paymentTokenAddress,
            _level
        );
        //Store the generated contract
        deployedContracts[_level].push(inv);
        //emit contract generation event
        emit ContractCreated(
            deployedContracts[_level].length,
            address(inv),
            _level
        );
        //return address
        return address(inv);
    }

    /// @notice Returns the total amount invested by the user across all levels.
    /// @dev The function iterates over all deployed contracts and sums up the balance of the user in each contract.
    /// @param _user The address of the user.
    /// @return userTotal The total amount invested by the user.
    function getAddressTotal(
        address _user
    ) external view returns (uint userTotal) {
        //Cicle through every level
        for (uint i = 1; i <= 3; i++) {
            //Cicle through every investment in every level
            for (uint j = 0; j < deployedContracts[i].length; j++) {
                //sum value to user total
                userTotal += ERC20(deployedContracts[i][j]).balanceOf(_user);
            }
        }
    }

    /// @notice Returns the total amount invested by the user at a specific level.
    /// @dev The function iterates over all deployed contracts at the specified level and sums up the balance of the user in each contract.
    /// @param _user The address of the user.
    /// @param _level The level of the Investment contracts.
    /// @return userTotal The total amount invested by the user at the specified level.
    function getAddressTotalInLevel(
        address _user,
        uint _level
    ) external view returns (uint userTotal) {
        //Cicle through every investment in given level
        for (uint i = 0; i < deployedContracts[_level].length; i++) {
            //sum value to user total
            userTotal += ERC20(deployedContracts[_level][i]).balanceOf(_user);
        }
    }

    /// @notice Returns the total amount invested by the caller in a specific contract.
    /// @dev The function gets the balance of the caller in the specified contract.
    /// @param _contractAddress The address of the Investment contract.
    /// @return userTotal The total amount invested by the caller in the specified contract.
    function getAddressOnContract(
        address _contractAddress
    ) external view returns (uint userTotal) {
        userTotal = ERC20(_contractAddress).balanceOf(msg.sender);
    }

    /// @notice Updates the SLCore address.
    /// @dev The function requires the caller to be a CEO and the platform to be active. It also checks if the _slCoreAddress is not a zero address.
    /// @param  _slCoreAddress The new SLCore address.
    /// @custom:requires  CEO access Level
    /// @custom:intent If SLCore gets compromised, there's a way to fixed factory withouth the need of redeploying
    function setEntryAddress(
        address _slCoreAddress
    ) external isCEO isNotGloballyStoped {
        require(
            _slCoreAddress != address(0),
            "Factory: Provide a real address in the parameters."
        );
        slCoreAddress = _slCoreAddress;
    }

    /// @notice Returns the address of the last deployed Investment contract at a specific level.
    /// @dev The function returns a zero address if there are no deployed contracts at the specified level.
    /// @param  _level The level of the Investment contracts.
    /// @return contractAddress The address of the last deployed Investment contract at the specified level.
    function getLastDeployedContract(
        uint _level
    ) external view returns (address contractAddress) {
        if (deployedContracts[_level].length > 0) {
            contractAddress = address(
                deployedContracts[_level][deployedContracts[_level].length - 1]
            );
        } else {
            contractAddress = address(0);
        }
    }

    modifier isNotGloballyStoped() {
        require(
            !ISLPermissions(SLPERMISSIONS_ADDRESS).isPlatformPaused(),
            "Platform paused"
        );
        _;
    }
    modifier isCEO() {
        require(
            ISLPermissions(SLPERMISSIONS_ADDRESS).isCEO(msg.sender),
            "User not CEO"
        );
        _;
    }
}
