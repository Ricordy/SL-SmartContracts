// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./Investment.sol";

/// @title SLFactory
/// @author Something Legendary
/// @notice This contract is responsible for deploying new Investment contracts and managing them.
/// @dev This contract uses an external contract for access control (SLPERMISSIONS_ADDRESS) and requires a valid SLCore address to initialize Investment contracts.
contract Factory {
    ///
    //-----STATE VARIABLES------
    ///
    /// @notice A mapping that stores deployed Investment contracts by their level.
    /// @dev The key is the level of the Investment contract and the value is an array of Investment contracts at that level.
    mapping(uint256 => Investment[]) public deployedContracts;
    /// @notice Stores SLCore address
    /// @dev Used to initialize Investment contracts
    address public slCoreAddress;
    /// @notice Stores SLPermissions address
    /// @dev Used to Control Access to certain functions
    address public immutable SLPERMISSIONS_ADDRESS;

    ///
    //-----EVENTS------
    ///
    /// @notice An event that is emitted when a new Investment contract is deployed.
    /// @param contractId The ID of the new contract in its level.
    /// @param conAddress The address of the new contract.
    /// @param conLevel The level of the new contract.
    event ContractCreated(
        uint256 indexed contractId,
        address indexed conAddress,
        uint256 indexed conLevel
    );

    /// @notice An event that is emitted when the SLCore address is updated.
    /// @param slCoreAddress The new SLCore address.
    event SLCoreAddressSet(address indexed slCoreAddress);

    ///
    //-----ERRORS------
    ///
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

    ///
    //-----CONSTRUCTOR------
    ///
    /// @notice Initializes the contract with the address of the SLPermissions contract.
    /// @param _slPermissionsAddress The address of the SLPermissions contract.
    constructor(address _slPermissionsAddress) {
        if (_slPermissionsAddress == address(0)) {
            revert InvalidAddress("SLPermissions");
        }
        SLPERMISSIONS_ADDRESS = _slPermissionsAddress;
    }

    ///
    //-----MAIN FUNCTIONS------
    ///
    /// @notice Deploys a new Investment contract with the specified parameters.
    /// @dev The function requires the caller to be a CEO and the platform to be active. It also checks if the slCoreAddress and _paymentTokenAddress are not zero addresses and if the _level is within the range 1-3.
    /// @param  _totalInvestment The total amount of tokens needed to fulfill the investment.
    /// @param  _paymentTokenAddress0 The address of the payment token 0.
    /// @param  _paymentTokenAddress1 The address of the payment token 1.
    /// @param _level The level of the new Investment contract.
    /// @return The address of the newly deployed Investment contract.
    /// @custom:requires  1 <= level <= 3 and CEO access Level
    function deployNew(
        uint256 _totalInvestment,
        address _paymentTokenAddress0,
        address _paymentTokenAddress1,
        uint256 _level
    ) external isCEO isNotGloballyStopped returns (address) {
        // Check if addresses are valid
        if (slCoreAddress == address(0)) {
            revert InvalidAddress("SLCore");
        }
        if (_paymentTokenAddress0 == address(0)) {
            revert InvalidAddress("PaymentToken1");
        }
        if (_paymentTokenAddress1 == address(0)) {
            revert InvalidAddress("PaymentToken2");
        }
        // Check if level is valid
        if (_level == 0) {
            revert InvalidLevel(_level, 1, 3);
        }
        if (_level > 3) {
            revert InvalidLevel(_level, 1, 3);
        }

        //Generate new Investment contract with given parameters
        Investment inv = new Investment(
            _totalInvestment,
            SLPERMISSIONS_ADDRESS,
            slCoreAddress,
            _paymentTokenAddress0,
            _paymentTokenAddress1,
            _level
        );
        //Store the generated contract in the array in the correct level position
        deployedContracts[_level].push(inv);
        //emit contract generation event
        emit ContractCreated(
            deployedContracts[_level].length,
            address(inv),
            _level
        );
        //return address of the new contract
        return address(inv);
    }

    /// @notice Updates the SLCore address.
    /// @dev The function requires the caller to be a CEO and the platform to be active. It also checks if the _slCoreAddress is not a zero address.
    /// @param  _slCoreAddress The new SLCore address.
    /// @custom:requires  CEO access Level
    /// @custom:intent If SLCore gets compromised, there's a way to fix the factory withouth the need of redeploying
    function setSLCoreAddress(
        address _slCoreAddress
    ) external isCEO isNotGloballyStopped {
        // Check if address is valid
        if (_slCoreAddress == address(0)) {
            revert InvalidAddress("SLCore");
        } else {
            slCoreAddress = _slCoreAddress;
            emit SLCoreAddressSet(_slCoreAddress);
        }
    }

    /// @notice Returns the total amount invested by all users across all levels.
    /// @dev The function iterates over all deployed contracts and sums up the totalSupply(representative of the investments) in each contract.
    /// @return platformTotal The total amount invested by all users in the platform.
    function getTotalInvestedInPlatform()
        external
        view
        returns (uint256 platformTotal)
    {
        //Cicle through every level
        for (uint256 i = 1; i <= 3; ++i) {
            //Cicle through every investment in every level
            uint256 numberOfContracts = deployedContracts[i].length;
            for (uint256 j; j < numberOfContracts; j++) {
                //sum the total invested in each of them
                platformTotal += ERC20(deployedContracts[i][j]).totalSupply();
            }
        }
    }

    /// @notice Returns the total amount invested by the user across all levels.
    /// @dev The function iterates over all deployed contracts and sums up the balance of the user in each contract.
    /// @param _user The address of the user.
    /// @return userTotal The total amount invested by the user.
    function getAddressTotal(
        address _user
    ) external view returns (uint256 userTotal) {
        //Cicle through every level
        for (uint256 i = 1; i <= 3; ++i) {
            //Cicle through every investment in every level
            uint256 numberOfContracts = deployedContracts[i].length;
            for (uint256 j = 0; j < numberOfContracts; j++) {
                //sum value to user total
                userTotal += IERC20(deployedContracts[i][j]).balanceOf(_user);
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
        uint256 _level
    ) external view returns (uint256 userTotal) {
        //Cicle through every investment in given level
        uint256 numberOfContracts = deployedContracts[_level].length;
        for (uint256 i = 0; i < numberOfContracts; ++i) {
            //sum value to user total
            userTotal += IERC20(deployedContracts[_level][i]).balanceOf(_user);
        }
    }

    /// @notice Returns the total amount invested by the caller in a specific contract.
    /// @dev The function gets the balance of the caller in the specified contract.
    /// @param _contractAddress The address of the Investment contract.
    /// @return userTotal The total amount invested by the caller in the specified contract.
    function getAddressOnContract(
        address _contractAddress
    ) external view returns (uint256 userTotal) {
        //Get balance of caller in contract
        userTotal = IERC20(_contractAddress).balanceOf(msg.sender);
    }

    /// @notice Returns the address of the last deployed Investment contract at a specific level.
    /// @dev The function returns a zero address if there are no deployed contracts at the specified level.
    /// @param  _level The level of the Investment contracts.
    /// @return contractAddress The address of the last deployed Investment contract at the specified level.
    function getLastDeployedContract(
        uint256 _level
    ) external view returns (address contractAddress) {
        // Verify if there are any contracts deployed at the specified level
        if (deployedContracts[_level].length != 0) {
            // Return the address of the last deployed contract
            contractAddress = address(
                deployedContracts[_level][deployedContracts[_level].length - 1]
            );
        } else {
            // Return a zero address
            contractAddress = address(0);
        }
    }

    ///
    //---- MODIFIERS------
    ///
    /// @notice Verifies if platform is paused.
    /// @dev If platform is paused, the whole contract is stopped
    modifier isNotGloballyStopped() {
        if (ISLPermissions(SLPERMISSIONS_ADDRESS).isPlatformPaused()) {
            revert PlatformPaused();
        }
        _;
    }
    /// @notice Verifies if user is CEO.
    /// @dev CEO has the right to interact with: deployNew() and setSLCoreAddress()
    modifier isCEO() {
        if (!ISLPermissions(SLPERMISSIONS_ADDRESS).isCEO(msg.sender)) {
            revert NotCEO();
        }
        _;
    }
}
