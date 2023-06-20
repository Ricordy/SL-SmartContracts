// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract SLPermissions {
    // This facet controls access control for Something Legendary. There are three roles managed here:
    //
    //     - The CEO: The CEO can reassign other roles and change the addresses of our dependent smart
    //         contracts. It is also the only role that can unpause the smart contract. It is initially
    //         set to the address that created the smart contract in the SLCore constructor.
    //
    //     - The CFO: The CFO can withdraw/refill funds from every investment contract.
    //
    // It should be noted that these roles are distinct without overlap in their access abilities, the
    // abilities listed for each role above are exhaustive. In particular, while the CEO can assign any
    // address to any role, the CEO address itself doesn't have the ability to act in those roles. This
    // restriction is intentional so that we aren't tempted to use the CEO address frequently out of
    // convenience. The less we use an address, the less likely it is that we somehow compromise the
    // account.

    /// @dev Emited when contract is upgraded - See README.md for updgrade plan
    event ContractUpgrade(address newContract);

    // The addresses of the accounts (or contracts) that can execute actions within each roles.
    address public ceoAddress;
    address public cfoAddress;
    mapping(address => bool) public allowedContracts;

    // @dev Keeps track whether the contract is paused. When that is true, most actions are blocked
    bool public paused = false;
    bool public pausedEntryMint = false;
    bool public pausedPuzzleMint = false;
    bool public pausedInvestments = false;

    constructor(address _ceoAddress, address _cfoAddress) {
        ceoAddress = _ceoAddress;
        cfoAddress = _cfoAddress;
    }

    /// @dev Access modifier for CEO-only functionality
    modifier onlyCEO() {
        require(msg.sender == ceoAddress);
        _;
    }

    /// @dev Access modifier for CFO-only functionality
    modifier onlyCFO() {
        require(msg.sender == cfoAddress);
        _;
    }

    modifier onlyCLevel() {
        require(msg.sender == ceoAddress || msg.sender == cfoAddress);
        _;
    }

    function isCEO(address _address) external view returns (bool) {
        console.log("input ceo:", _address);
        console.log("real ceo:", ceoAddress);
        return (_address == ceoAddress);
    }

    /// @dev Access modifier for CFO-only functionality
    function isCFO(address _address) external view returns (bool) {
        return (_address == cfoAddress);
    }

    function isCLevel(address _address) external view returns (bool) {
        return (_address == ceoAddress || _address == cfoAddress);
    }

    function isAllowedContract(
        address _conAddress
    ) external view returns (bool) {
        return (allowedContracts[_conAddress]);
    }

    /// @dev Assigns a new address to act as the CEO. Only available to the current CEO.
    /// @param _newCEO The address of the new CEO
    function setCEO(address _newCEO) external onlyCEO {
        require(_newCEO != address(0));

        ceoAddress = _newCEO;
    }

    /// @dev Assigns a new address to act as the CFO. Only available to the current CEO.
    /// @param _newCFO The address of the new CFO
    function setCFO(address _newCFO) external onlyCEO {
        require(_newCFO != address(0));

        cfoAddress = _newCFO;
    }

    function setAllowedContracts(
        address _contractAddress,
        bool _allowed
    ) external onlyCEO {
        allowedContracts[_contractAddress] = _allowed;
    }

    /*** Pausable functionality adapted from OpenZeppelin ***/

    /// @dev Modifier to allow actions only when the contract IS NOT paused
    function isPlatformPaused() external view returns (bool) {
        return (paused);
    }

    /// @dev Modifier to allow actions only when the contract IS NOT paused
    function isEntryMintPaused() external view returns (bool) {
        return (pausedEntryMint || paused);
    }

    /// @dev Modifier to allow actions only when the contract IS NOT paused
    function isPuzzleMintPaused() external view returns (bool) {
        return (pausedPuzzleMint || paused);
    }

    /// @dev Modifier to allow actions only when the contract IS paused
    function isInvestmentsPaused() external view returns (bool) {
        return (pausedInvestments || paused);
    }

    /// @dev Called by any "C-level" role to pause the contract. Used only when
    ///  a bug or exploit is detected and we need to limit damage.
    function pausePlatform() external onlyCLevel {
        paused = true;
    }

    function pauseEntryMint() external onlyCLevel {
        pausedEntryMint = true;
    }

    function pauseInvestments() external onlyCLevel {
        pausedInvestments = true;
    }

    /// @dev Unpauses the smart contract. Can only be called by the CEO, since
    ///  one reason we may pause the contract is when CFO or COO accounts are
    ///  compromised.
    /// @notice This is public rather than external so it can be called by
    ///  derived contracts.
    function unpausePlatform() external onlyCEO {
        // can't unpause if contract was upgraded
        paused = false;
    }

    function unpauseEntryMint() external onlyCEO {
        pausedEntryMint = false;
    }

    function unpauseInvestments() external onlyCEO {
        pausedInvestments = false;
    }
}
