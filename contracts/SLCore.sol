// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SLPuzzles.sol";

contract SLCore is SLPuzzles {
    constructor(
        address _factoryAddress,
        address _slLogicsAddress,
        address _slPermissionsAddress
    ) {
        require(
            _factoryAddress != address(0) && _slLogicsAddress != address(0),
            "SLCore: Re-check input parameters"
        );

        factoryAddress = _factoryAddress;

        slLogicsAddress = _slLogicsAddress;

        slPermissionsAddress = _slPermissionsAddress;
    }

    ///FUNCTIONS FOR USERS

    function mintEntry() public isEntryMintNotPaused nonReentrant {
        require(
            _whichLevelUserHas(msg.sender) == 0,
            "SLCore: User have an entry token"
        );
        //run internal logic to mint entry token
        _buyEntryToken(msg.sender);
        //Initiliaze token and Ask for payment
        ISLLogics(slLogicsAddress).payEntryFee(msg.sender);
    }

    function claimPiece()
        public
        isPuzzleMintNotPaused
        nonReentrant
        userHasLevel(1)
    {
        //claim the piece for the user
        _claimPiece(msg.sender, _whichLevelUserHas(msg.sender));
    }

    //function to claim level
    function claimLevel()
        public
        isPuzzleMintNotPaused
        nonReentrant
        userHasLevel(1)
    {
        //Check if user has the highest level
        require(
            _whichLevelUserHas(msg.sender) < 3,
            "SLCore: User at Top Level"
        );
        //Claim next level for user depending on the level he has
        _claimLevel(msg.sender, _whichLevelUserHas(msg.sender) == 1 ? 30 : 31);
    }

    ///FUNCTIONS FOR ADMINS

    //function to generate a new entry batch using internal logic
    function generateNewEntryBatch(
        uint _cap,
        uint _entryPrice,
        string memory _tokenUri
    ) public isNotGloballyStoped isCEO {
        ENTRY_IDS.push(mountEntryValue(_cap, 0));
        ISLLogics(slLogicsAddress).setEntryPrice(_entryPrice, _tokenUri);
    }

    function uri(
        uint256 _tokenId
    ) public view override returns (string memory) {
        return ISLLogics(slLogicsAddress).uri(_tokenId);
    }

    function mintTest(uint level) public {
        for (uint i = 0; i < 10; i++) {
            _mint(msg.sender, _getPuzzleCollectionIds(level)[i], 1, "");
            _incrementUserPuzzlePieces(msg.sender, level);
        }
    }
}
