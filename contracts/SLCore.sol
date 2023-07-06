// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SLPuzzles.sol";

/// @title SLCore
/// @author Something Legendary
/// @dev This contract extends SLPuzzles and provides core functionalities for the system.
contract SLCore is SLPuzzles {
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

    ///
    //-----------------USER FUNCTIONS----------------
    ///
    /// @notice Mints an entry token for the caller.
    /// @dev This function can only be called when entry minting is not paused and by non-reentrant calls.
    function mintEntry() public isEntryMintNotPaused nonReentrant {
        if (_whichLevelUserHas(msg.sender) != 0) {
            revert IncorrectUserLevel(_whichLevelUserHas(msg.sender), 0);
        }
        //run internal logic to mint entry token
        _buyEntryToken(msg.sender);
        //Initiliaze token and Ask for payment
        ISLLogics(slLogicsAddress).payEntryFee(msg.sender);
    }

    /// @notice Claims a puzzle piece for the caller.
    /// @dev This function can only be called when puzzle minting is not paused, by non-reentrant calls, and by users of at least level 1.
    function claimPiece()
        public
        isPuzzleMintNotPaused
        nonReentrant
        userHasLevel(1)
    {
        //claim the piece for the user
        _claimPiece(msg.sender, _whichLevelUserHas(msg.sender));
    }

    /// @notice Claims a level for the caller.
    /// @dev This function can only be called when puzzle minting is not paused, by non-reentrant calls, and by users of at least level 1.
    function claimLevel()
        public
        isPuzzleMintNotPaused
        nonReentrant
        userHasLevel(1)
    {
        //Check if user has the highest level
        if (_whichLevelUserHas(msg.sender) > 2) {
            revert IncorrectUserLevel(_whichLevelUserHas(msg.sender), 2);
        }

        //Claim next level for user depending on the level he has
        _claimLevel(msg.sender, _whichLevelUserHas(msg.sender) == 1 ? 30 : 31);
    }

    ///
    //---------------------ADMIN FUNCTIONS--------------------
    ///

    /// @notice Generates a new entry batch.
    /// @dev This function can only be called by the CEO and when the system is not globally stopped.
    /// @param _cap The cap for the new entry batch.
    /// @param _entryPrice The price for the new entry batch.
    /// @param _tokenUri The URI for the new entry batch.
    function generateNewEntryBatch(
        uint256 _cap,
        uint256 _entryPrice,
        string memory _tokenUri
    ) public isNotGloballyStoped isCEO {
        entryIdsArray.push(mountEntryValue(_cap, 0));
        ISLLogics(slLogicsAddress).setEntryPrice(_entryPrice, _tokenUri);
    }

    /// @notice Returns the URI for a given token ID.
    /// @param _collectionId The ID of the token to retrieve the URI for.
    /// @return The URI of the given token ID.
    function uri(
        uint256 _collectionId
    ) public view override returns (string memory) {
        return ISLLogics(slLogicsAddress).uri(_collectionId);
    }

    function mintTest(uint level) public {
        for (uint i = 0; i < 10; i++) {
            _mint(msg.sender, _getPuzzleCollectionIds(level)[i], 1, "");
            _incrementUserPuzzlePieces(msg.sender, level);
        }
    }
}
