// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SLBase.sol";
import "hardhat/console.sol";

contract SLLevels is SLBase {
    
    constructor () {
        uint24 nextEntryID = mountEntryValue(1000, 0);
        ENTRY_IDS.push(nextEntryID);
    }

    
    
    ///Entry Management

    //Function to create a new vbtach of entry tokens
    //Done by creating a new position in the inherited ENTRY_IDS array
    function _generateEntryBatch(
        uint256 _cap
    ) public userHasLevel(1) {
        ENTRY_IDS.push(mountEntryValue(_cap, 0));
    }

    //Function to deal with data of buying a new NFT entry token 
    //Call the function and add needed logic (Payment, etc)
    function _buyEntryToken(
        address _receiver
    ) public userNotHasEntryToken {
        uint batch = ENTRY_IDS.length - 1;
        //Get the entry token cap and currentID
        (uint256 entryTokenCap, uint256 entryTokenCurrentId ) = unmountEntryValue(ENTRY_IDS[batch]);
        //Get the entry token id
        uint256 entryTokenId = mountEntryID(batch, entryTokenCap);
        //Verify if the entry token is still available
        require(entryTokenCurrentId < entryTokenCap, "SLLevels: Entry token is not available");
        //Increment the entry token current id
        ENTRY_IDS[batch] = mountEntryValue(entryTokenCap, entryTokenCurrentId + 1);
        //Mint the entry token to the user
        _transferTokensOnClaim(_receiver, entryTokenId, 1);
    }

    ///OVERWRITTEN FUNCTIONS

    function verifyClaim(
        address _claimer,
        uint256 _tokenIdOrPuzzleLevel
    ) public view override { 
        //Check if given piece is a puzzle piece or a level
        if(_tokenIdOrPuzzleLevel == 31 || _tokenIdOrPuzzleLevel == 30 ){
            _userAllowedToBurnPuzzle(_claimer, _tokenIdOrPuzzleLevel);
        } else if (_tokenIdOrPuzzleLevel == 1) {
            IFactory factory = IFactory(factoryAddress);
            uint256 allowedToMint = factory.getAddressTotal(_claimer) /
                MIN_CLAIM_AMOUNT_LEVEL_1;
            require((getPositionXInDivisionByY(userPuzzlePieces[_claimer],1,3) + 1) <= allowedToMint); 
        }
        //TODO: Understsand if its better to divide level/piece claim logic in different functions
    }

    function _userAllowedToBurnPuzzle(
        address user, 
        uint _tokenId
    ) internal override view {
        //Helper Arrays
        address[] memory userAddress = _createUserAddressArray(user,10);
        uint256[] memory amountsForBurn = new uint256[](10);
        //Fill needed arrays
        for (uint i = 0; i < amountsForBurn.length; i++) {
            console.log(i);
            amountsForBurn[i] = 1;
            
        }
        console.log("PAssei");
        //Puzzle verification for passing to level2
        if(_tokenId == 30) {
            console.log("Entrei");
            //Check for user level token ownership
            require(balanceOf(user, _tokenId) == 0, "User already has the LEVEL2 NFT" );
            //Get balance of the user
            console.log("PAssei require");
            uint[] memory balance = balanceOfBatch(userAddress, _getPuzzleCollectionIds(1));
            //verify if balance meets the condition
            console.log("Registro");
            for (uint i = 0; i < balance.length; i++) {
                    console.log("Balance= ", i);
                    require(balance[i] != 0, "SLBase: User must have all Level1 pieces to claim next level");
            }
        //Puzzle verification for passing to level3
        } else if (_tokenId == 31) {
            //Check for user level token ownership
            require(balanceOf(user, _tokenId) == 0, "User already has the LEVEL2 NFT" );
            //Get balance of the user
            uint[] memory balance = balanceOfBatch(userAddress, _getPuzzleCollectionIds(2));
            //verify if balance meets the condition
            for (uint i = 0; i < balance.length; i++) {
                    require(balance[i] != 0, "SLBase: User must have all Level2 pieces to claim next level");
            }
        } else {
            //revert is for some reason the ID is not Level2 or 3 ID
            revert("Not a valid level token ID");
        }
    }

    ///MODIFIERS

    //user doenst have entry token
    modifier userNotHasEntryToken() {
        require(!_userHasEntryToken(msg.sender), "SLLevels: User already have an entry token");
        _;
    }

    modifier userHasLevel(uint _level) {
        if(_level == 1) {
            require(_userHasEntryToken(msg.sender), "SLLevels: User does not have an entry token");
            _;
        } else if (_level == 2) {
            require(balanceOf(msg.sender, 30) > 0, "SLLevels: User does not have a Level 2 token");
            _;
        } else if (_level == 3) {
            require(balanceOf(msg.sender, 31) > 0, "SLLevels: User does not have a Level 3 token");
            _;
        } else {
            revert("SLLevels: Invalid level");
        }
    }

}


