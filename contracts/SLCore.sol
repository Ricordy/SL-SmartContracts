// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SLPuzzles.sol";

contract SLCore is SLPuzzles {

    
    constructor(address _factoryAddress, address _slLogicsAddress) {
        require(_factoryAddress != address(0)  && _slLogicsAddress != address(0), "SLCore: Re-check input parameters");
        // the creator of the contract is the initial CEO
        ceoAddress = msg.sender;

        // the creator of the contract is also the initial COO
        cfoAddress = msg.sender;

        factoryAddress = _factoryAddress;

        slLogicsAddress = _slLogicsAddress;

    }

    ///FUNCTIONS FOR USERS
    
    function mintEntry() public whenNotPaused nonReentrant whenEntryNotPaused {
        require(_whichLevelUserHas(msg.sender) == 0, "SLCore: User have an entry token");
        //run internal logic to mint entry token
        _buyEntryToken(msg.sender);
        //Initiliaze token and Ask for payment
        ISLLogics(slLogicsAddress).payEntryFee(msg.sender);
        

    }

    function claimPiece() public whenNotPaused nonReentrant userHasLevel(1){
        //claim the piece for the user
        _claimPiece(msg.sender, _whichLevelUserHas(msg.sender));
        
    }

    //function to claim level
    function claimLevel() public whenNotPaused nonReentrant userHasLevel(1) {
        //Check if user has the highest level
        require(_whichLevelUserHas(msg.sender) < 3, "SLCore: User at Top Level");
        //Claim next level for user depending on the level he has
        _claimLevel(msg.sender, _whichLevelUserHas(msg.sender) == 1 ? 30 : 31);
    }

    ///FUNCTIONS FOR ADMINS

    //function to generate a new entry batch using internal logic
    function generateNewEntryBatch(uint _cap, uint _entryPrice) public whenNotPaused onlyCEO {
        ENTRY_IDS.push(mountEntryValue(_cap, 0));
        ISLLogics(slLogicsAddress).setEntryPrice(_entryPrice);

    }

    function mintTest(uint level) public {
        for (uint i = 0; i < 10; i++) {
            _mint(msg.sender,_getPuzzleCollectionIds(level)[i],1,"");
            
        }
        
    }
}

/**
 * if metadata is better in SLCore or logics?  Same 
 * if in SLLogics, if we need it to be dynamic or manual
 *  - This does not need to be dynamic, it can be manual, simplifying the amount of transactions
 * - reducing the external transactions bring security. 
 */