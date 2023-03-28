// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SLBase.sol";


contract SLLevels is SLBase {
    
    constructor () {
        uint24 nextEntryID = mountEntryValue(1000, 0);
        ENTRY_IDS.push(nextEntryID);
    }

    
    
    ///Entry Management

    //Function to create a new vbtach of entry tokens
    //Done by creating a new position in the inherited ENTRY_IDS array
    function _generateEntryBatch(uint256 _cap) public userHasEntryToken {
        ENTRY_IDS.push(mountEntryValue(_cap, 0));
    }

    //Function to deal with data of buying a new NFT entry token 
    //Call the function and add needed logic (Payment, etc)
    function _buyEntryToken(address _receiver) public userNotHasEntryToken {
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
        for (uint i = 0; i < userAddress.length; i++) {
            amountsForBurn[i] = 1;
        }
        //Puzzle verification for passing to level2
        if(_tokenId == 30) {
            //Check for user level token ownership
            require(balanceOf(user, _tokenId) == 0, "User already has the LEVEL2 NFT" );
            //Get balance of the user
            uint[] memory balance = balanceOfBatch(userAddress, _getPuzzleCollectionIds(1));
            //verify if balance meets the condition
            for (uint i = 0; i < balance.length; i++) {
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


    ///GETTERS

    //Function to verify if the user has an entry token returns boolean
    function _userHasEntryToken(address _user) internal view returns (bool) {
        //Get the entry token ids
        uint256[] memory entryTokenIds = _getEntryTokenIds();
        //Get the balance of the user for each entry token id
        uint256[] memory userBalance = balanceOfBatch(_createUserAddressArray(_user, entryTokenIds.length), entryTokenIds);
        //Verify if the user has any entry token
        for(uint i = 0; i < userBalance.length; i++) {
            if(userBalance[i] > 0) {
                return true;
            }
        }
        return false;   
    }

    //function to get entry token ids
    function _getEntryTokenIds() internal view returns (uint256[] memory) {
        uint256[] memory entryTokenIds = new uint256[](ENTRY_IDS.length);
        for(uint i = 0; i < ENTRY_IDS.length; i++) {
            //i is the batch number
            //get the entry token cap to mount the entry token id
            (uint256 entryTokenCap, ) = unmountEntryValue(ENTRY_IDS[i]);
            entryTokenIds[i] = mountEntryID(i, entryTokenCap);
        }
        return entryTokenIds;
    }

    ///MODIFIERS

    //Modifier to verify if the user has an entry token
    modifier userHasEntryToken() {
        require(_userHasEntryToken(msg.sender), "SLLevels: User does not have an entry token");
        _;
    }
    //user doenst have entry token
    modifier userNotHasEntryToken() {
        require(!_userHasEntryToken(msg.sender), "SLLevels: User already have an entry token");
        _;
    }

    //Modifier to verify if the user has Level 2 token
    modifier userHasLevel2Token() {
        require(balanceOf(msg.sender, 30) > 0, "SLLevels: User does not have a Level 2 token");
        _;
    }

    //Modifier to verify if the user has Level 3 token
    modifier userHasLevel3Token() {
        require(balanceOf(msg.sender, 31) > 0, "SLLevels: User does not have a Level 3 token");
        _;
    }


}