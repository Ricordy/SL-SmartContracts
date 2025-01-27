// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

/// @title SLPermissions
/// @author Something Legendary (adapted from CryptoKitties)
/// @notice Access managment for Something Legendary Platform
/// @dev External contract, not upgradable.
contract SLPermissions {
    // This facet controls access control for Something Legendary. There are three roles managed here:
    //
    //     - The CEO: The CEO can reassign other roles and change the addresses of our dependent smart
    //         contracts. It is also the only role that can unpause the smart contract. It is initially
    //         set to the address that created the smart contract in the SLCore constructor. <---------------- FIX
    //
    //     - The CFO: The CFO can withdraw/refill funds from every investment contract.
    //
    // It should be noted that these roles are distinct without overlap in their access abilities, the
    // abilities listed for each role above are exhaustive. In particular, while the CEO can assign any
    // address to any role, the CEO address itself doesn't have the ability to act in those roles. This
    // restriction is intentional so that we aren't tempted to use the CEO address frequently out of
    // convenience. The less we use an address, the less likely it is that we somehow compromise the
    // account.

    /// @notice The CEO address.
    /// @dev this value is changable.
    address public ceoAddress;
    /// @notice The CFO address.
    /// @dev this value is changable.
    address public cfoAddress;
    /// @notice the mapping with allowed contracts.
    /// @dev the key is the contract address, permssions can be withdrawn from the contract.
    mapping(address => uint256) public allowedContracts;

    /// @notice The global platform pause.
    /// @dev When true, the whole platform stopes working.
    uint256 public paused = 0;
    /// @notice The entry minting pause.
    /// @dev When true, the minting entry NFTs is disallowed.
    uint256 public pausedEntryMint = 0;
    /// @notice The levels and puzzles pause.
    /// @dev When true, the claiming of new pieces or puzzles is disallowed.
    uint256 public pausedPuzzleMint = 0;
    /// @notice The global investment pause.
    /// @dev When true, ervery investment in the platform is stopped.
    uint256 public pausedInvestments = 0;

    ///
    //-----ERRORS------
    ///
    /// @notice Reverts if a certain address == address(0)
    /// @param reason which address is missing
    error InvalidAddress(string reason);

    /// @notice Reverts if a certain address == address(0)
    /// @param max max input value
    /// @param input input value
    error InvalidNumber(uint256 max, uint256 input);

    ///Function caller is not CEO level
    error NotCEO();

    ///Function caller is not CEO level
    error NotCLevel();

    ///
    //-----EVENTS------
    ///
    /// @notice An event thats emitted when a new CEO address is set.
    /// @param previousCEO The address being replaced.
    /// @param newCEO The new CEO address.
    event CEOSet(address indexed previousCEO, address indexed newCEO);

    /// @notice An event thats emitted when a new CFO address is set.
    /// @param previousCFO The address being replaced.
    /// @param newCFO The new CFO address.
    event CFOSet(address indexed previousCFO, address indexed newCFO);

    /// @notice An event thats emitted when a new contract is allowed.
    /// @param contractAddress The address of the contract.
    /// @param allowed The new status of the contract.
    event ContractAllowed(
        address indexed contractAddress,
        uint256 indexed allowed
    );

    /// @notice An event thats emitted when the Platform is paused.
    /// @param paused The new status of the contract.
    event PlatformPaused(uint256 indexed paused);

    /// @notice An event thats emitted when the Entry Mint is paused.
    /// @param paused The new status of the contract.
    event EntryMintPaused(uint256 indexed paused);

    /// @notice An event thats emitted when the Puzzle Mint is paused.
    /// @param paused The new status of the contract.
    event PuzzleMintPaused(uint256 indexed paused);

    /// @notice An event thats emitted when the Investments are paused.
    /// @param paused The new status of the contract.
    event InvestmentsPaused(uint256 indexed paused);

    ///
    //-----CONSTRUCTOR------
    ///
    /// @notice Initializes the Permissions contract
    /// @param _ceoAddress The address of the CEO
    /// @param _cfoAddress The address of the CFO.
    constructor(address _ceoAddress, address _cfoAddress) {
        if (_ceoAddress == address(0)) {
            revert InvalidAddress("CEO");
        }
        if (_cfoAddress == address(0)) {
            revert InvalidAddress("CFO");
        }
        ceoAddress = _ceoAddress;
        cfoAddress = _cfoAddress;
    }

    /// @dev Access modifier for CEO-only functionality
    modifier onlyCEO() {
        if (msg.sender != ceoAddress) {
            revert NotCEO();
        }
        _;
    }

    /// @dev Access modifier for CEO-CFO-only functionality
    modifier onlyCLevel() {
        if (msg.sender != ceoAddress && msg.sender != cfoAddress) {
            revert NotCLevel();
        } else {
            _;
        }
    }

    /// @notice external function for CEO verification
    /// @param _address caller address
    function isCEO(address _address) external view returns (bool) {
        return (_address == ceoAddress);
    }

    /// @notice external function for CFO verification
    /// @param _address caller address
    function isCFO(address _address) external view returns (bool) {
        return (_address == cfoAddress);
    }

    /// @notice external function for CEO or CFO verification
    /// @param _address caller address
    function isCLevel(address _address) external view returns (bool) {
        return (_address == ceoAddress || _address == cfoAddress);
    }

    /// @notice external function for allowed-contract verification
    /// @param _conAddress caller contract address
    function isAllowedContract(
        address _conAddress
    ) external view returns (bool) {
        return (allowedContracts[_conAddress] == 1);
    }

    /// @dev Assigns a new address to act as the CEO. Only available to the current CEO.
    /// @param _newCEO The address of the new CEO
    function setCEO(address _newCEO) external onlyCEO {
        if (_newCEO == address(0)) {
            revert InvalidAddress("CEO");
        }
        if (_newCEO == cfoAddress) {
            revert InvalidAddress("User is CFO");
        }
        emit CEOSet(ceoAddress, _newCEO);
        ceoAddress = _newCEO;
    }

    /// @dev Assigns a new address to act as the CFO. Only available to the current CEO.
    /// @param _newCFO The address of the new CFO
    function setCFO(address _newCFO) external onlyCEO {
        if (_newCFO == address(0)) {
            revert InvalidAddress("CFO");
        }
        if (_newCFO == ceoAddress) {
            revert InvalidAddress("User is CEO");
        }
        emit CFOSet(cfoAddress, _newCFO);
        cfoAddress = _newCFO;
    }

    /// @dev assigns a boolean value for contract access control
    /// @param _contractAddress The address of the contract
    /// @param _allowed the new status for the access control
    function setAllowedContracts(
        address _contractAddress,
        uint256 _allowed
    ) external onlyCEO {
        if (_allowed > 1) {
            revert InvalidNumber(1, _allowed);
        }
        emit ContractAllowed(_contractAddress, _allowed);
        allowedContracts[_contractAddress] = _allowed;
    }

    /*** Pausable functionality adapted from OpenZeppelin ***/

    /// @dev function to allow actions only when the contract IS NOT paused
    function isPlatformPaused() external view returns (bool) {
        return (paused == 1);
    }

    /// @dev function to allow actions only when the contract IS NOT paused
    function isEntryMintPaused() external view returns (bool) {
        return (pausedEntryMint == 1 || paused == 1);
    }

    /// @dev function to allow actions only when the contract IS NOT paused
    function isClaimPaused() external view returns (bool) {
        return (pausedPuzzleMint == 1 || paused == 1);
    }

    /// @dev function to allow actions only when the contract IS paused
    function isInvestmentsPaused() external view returns (bool) {
        return (pausedInvestments == 1 || paused == 1);
    }

    /// @dev Called by any "C-level" role to pause each of the functionalities. Used only when
    ///  a bug or exploit is detected and we need to limit damage.
    function pausePlatform() external onlyCLevel {
        paused = 1;
        emit PlatformPaused(paused);
    }

    function pauseEntryMint() external onlyCLevel {
        pausedEntryMint = 1;
        emit EntryMintPaused(pausedEntryMint);
    }

    function pausePuzzleMint() external onlyCLevel {
        pausedPuzzleMint = 1;
        emit PuzzleMintPaused(pausedPuzzleMint);
    }

    function pauseInvestments() external onlyCLevel {
        pausedInvestments = 1;
        emit InvestmentsPaused(pausedInvestments);
    }

    /// @dev Unpauses the functionalities. Can only be called by the CEO, since
    ///  one reason we may pause the contract is when CFO account is
    ///  compromised.
    function unpausePlatform() external onlyCEO {
        paused = 0;
        emit PlatformPaused(paused);
    }

    function unpauseEntryMint() external onlyCEO {
        pausedEntryMint = 0;
        emit EntryMintPaused(pausedEntryMint);
    }

    function unpausePuzzleMint() external onlyCEO {
        pausedPuzzleMint = 0;
        emit PuzzleMintPaused(pausedPuzzleMint);
    }

    function unpauseInvestments() external onlyCEO {
        pausedInvestments = 0;
        emit InvestmentsPaused(pausedInvestments);
    }
}
