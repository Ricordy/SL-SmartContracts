// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SLPuzzles.sol";

contract SLCore is SLPuzzles {
    constructor(address _factoryAddress, address _paymentTokenAddress, address _slLogicsAddress) {
        require(_factoryAddress != address(0) && _paymentTokenAddress != address(0) && _slLogicsAddress != address(0), "SLCore: Re-check input parameters");
        // the creator of the contract is the initial CEO
        ceoAddress = msg.sender;

        // the creator of the contract is also the initial COO
        cfoAddress = msg.sender;

        factoryAddress = _factoryAddress;


        slLogicsAddress = _slLogicsAddress;

    }

    ///FUNCTIONS FOR USERS
    
    function mintEntry() public whenNotPaused whenEntryNotPaused {
        require(!_userHasEntryToken(msg.sender), "SLLevels: User already have an entry token");
        //run internal logic to mint entry token
        _buyEntryToken(msg.sender);
        //Initiliaze token and Ask for payment
        ISLLogics(slLogicsAddress).payEntryFee(msg.sender);

    }

    function claimPiece() public whenNotPaused userHasLevel(1){
        //claim the piece for the user
        _claimPiece(msg.sender, _whichLevelUserHas(msg.sender));
    }

    //function to claim level
    function claimLevel() public whenNotPaused userHasLevel(1) {
        //Check which level user is
        uint userLevel = _whichLevelUserHas(msg.sender);
        //Check if user has the highest level
        require(userLevel < 3, "SLCore: User already has the highest level");
        //Claim next level for user depending on the level he has
        _claimLevel(msg.sender, userLevel == 1 ? 30 : 31);
    }

    ///FUNCTIONS FOR ADMINS

    //function to generate a new entry batch using internal logic
    function generateNewEntryBatch(uint _cap, uint _entryPrice) public whenNotPaused onlyCEO {
        _generateEntryBatch(_cap);
        ISLLogics(slLogicsAddress).setEntryPrice(_entryPrice);
    }
}