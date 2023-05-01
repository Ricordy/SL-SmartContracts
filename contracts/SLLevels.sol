// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SLBase.sol";

contract SLLevels is SLBase {

    //Function to deal with data of buying a new NFT entry token 
    //Call the function and add needed logic (Payment, etc)
    function _buyEntryToken(
        address _receiver
    ) internal {
        require(getCurrentEntryBatchRemainingTokens() > 0 && ENTRY_IDS.length > 0, "SLLevels: No entry tokens available");
        uint batch = ENTRY_IDS.length - 1;
        //Get the entry token cap and currentID
        (uint256 entryTokenCap, uint256 entryTokenCurrentId ) = unmountEntryValue(ENTRY_IDS[batch]);
        //Verify if the entry token is still available
        require(entryTokenCurrentId < entryTokenCap, "SLLevels: Entry token is not available");
        //Increment the entry token current id
        ENTRY_IDS[batch] = mountEntryValue(entryTokenCap, entryTokenCurrentId + 1);
        //Mint the entry token to the user
        _transferTokensOnClaim(_receiver, mountEntryID(batch, entryTokenCap), 1);
        emit TokensClaimed(_receiver,mountEntryID(batch, entryTokenCap), 1);
    }

    ///OVERWRITTEN FUNCTIONS

    function _userAllowedToBurnPuzzle(
        address user, 
        uint _tokenId
    ) internal view override {
        //Helper Arrays
        address[] memory userAddress = _createUserAddressArray(user,10);
        uint256[] memory amountsForBurn = new uint256[](10);
        uint[] memory balance;
        //Fill needed arrays
        for (uint i = 0; i < amountsForBurn.length; i++) {
            amountsForBurn[i] = 1;
            
        }
        //Puzzle verification for passing to level2
        if(_tokenId == 30) {
            //Check for user level token ownership
            require(balanceOf(user, _tokenId) == 0, "User already has the LEVEL2 NFT" );
            //Get balance of the user
            balance = balanceOfBatch(userAddress, _getPuzzleCollectionIds(1));
            //verify if balance meets the condition
            for (uint i = 0; i < balance.length; i++) {
                    require(balance[i] != 0, "SLLevels: User must have all Level1 pieces");
            }
        //Puzzle verification for passing to level3
        } else if (_tokenId == 31) {
            //Check for user level token ownership
            require(balanceOf(user, _tokenId) == 0, "User already has the LEVEL2 NFT" );
            //Get balance of the user
            balance = balanceOfBatch(userAddress, _getPuzzleCollectionIds(2));
            //verify if balance meets the condition
            for (uint i = 0; i < balance.length; i++) {
                    require(balance[i] != 0, "SLLevels: User must have all Level2 pieces");
            }
        } else {
            //revert is for some reason the ID is not Level2 or 3 ID
            revert("Not a valid level token ID");
        }
    }

    function _getLevelTokenIds(
        uint level
    ) internal view override returns (uint256[] memory) {
        if(level == 1){
            uint256[] memory entryTokenIds = new uint256[](ENTRY_IDS.length);
            for(uint i = 0; i < ENTRY_IDS.length; i++) {
                //i is the batch number
                //get the entry token cap to mount the entry token id
                (uint256 entryTokenCap, ) = unmountEntryValue(ENTRY_IDS[i]);
                entryTokenIds[i] = mountEntryID(i, entryTokenCap);
            }
            return entryTokenIds;
        } else if (level == 2 || level == 3) {
            uint256[] memory level2And3Ids = new uint256[](2);
            level2And3Ids[0] = 30;
            level2And3Ids[1] = 31;
            return level2And3Ids;
        }

    }
    //INTERNAL FUNCTIONS

    //fucntion to read in which level the user is
    function _whichLevelUserHas(
        address user
    ) internal view returns(uint) {
        //check if user has level 2 or 3 
        //call function to check user balance of token id 30 and 31
    
        //Verify level 2 and 3 token ownership
        if(balanceOf(user, 31) > 0) {
            return 3;
        } else if( balanceOf(user, 30) > 0){
            return 2;
        } else {
            //If user doesnt have level 2 or 3, check if user has entry token
            //Get the balance of the user for each entry token id
            uint256[] memory userBalance = balanceOfBatch(_createUserAddressArray(user, _getLevelTokenIds(1).length),_getLevelTokenIds(1));
            //Verify if the user has any entry token
            for(uint i = 0; i < userBalance.length; i++) {
                if(userBalance[i] > 0) {
                    return 1;
                }
            }
            return 0;
        }

        
    } 

    function whichLevelUserHas(
        address user
    ) external view returns(uint){
        return(_whichLevelUserHas(user));
    }

    ///GETTERS
    //function to verify how much tokens current entry collection has left
    function getCurrentEntryBatchRemainingTokens(
    ) public view returns(uint256) {
        (uint256 entryTokenCap, uint entryTokenCurrentId ) = unmountEntryValue(ENTRY_IDS[ENTRY_IDS.length - 1]);
        return (entryTokenCap - entryTokenCurrentId);
    }

    ///MODIFIERS

    modifier userHasLevel(uint _level) {
        //use _whichLevelUserHas to check if user has the level
        require(_whichLevelUserHas(msg.sender) >= _level, "SLLevels: User doesnt have the level");
        _;
    }


}


