// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./SLLevels.sol";

contract SLPuzzle is SLLevels{

    constructor () {
        
    }





    //OVERRIDES
    function verifyClaim(
        address _claimer,
        uint256 _tokenIdOrPuzzleLevel
    ) public view override { 
        //Check if given piece is a puzzle piece or a level
        if(_tokenIdOrPuzzleLevel == 31 || _tokenIdOrPuzzleLevel == 30 ){
            //Check if user has the ability to burn the puzzle piece
            _userAllowedToBurnPuzzle(_claimer, _tokenIdOrPuzzleLevel);
        } else if (_tokenIdOrPuzzleLevel == 1) {
            IFactory factory = IFactory(factoryAddress);
            uint256 allowedToMint = factory.getAddressTotal(_claimer) /
                MIN_CLAIM_AMOUNT;
            require((getPositionXInDivisionByY(userPuzzlePieces[_claimer],1,3) + 1) <= allowedToMint); 
        }
        //TODO: Understsand if its better to divide level/piece claim logic in different functions
    }

    function _getPuzzleCollectionIds(
        uint256 level
    ) public view override returns(uint256[] memory) {
        uint256[] memory ids = new uint256[](10);
        if(level == 1) {
            ids = getMultiplePositionsXInDivisionByY(COLLECTION_IDS, 1, 10, 2);
        } else if (level == 2) {
            ids = getMultiplePositionsXInDivisionByY(COLLECTION_IDS, 11, 10, 2);
        } else if (level == 3) {
            ids = getMultiplePositionsXInDivisionByY(COLLECTION_IDS, 21, 10, 2);
        } else {
            revert("Not a valid puzzle level");
        }
        return ids;
    }

    function _dealWithPuzzleClaiming(
        address _receiver,
        uint256 _puzzleLevel
    ) internal override returns (uint8 _collectionToMint) {
        //Helper Arrays
        uint256[] memory puzzleCollectionIds = _getPuzzleCollectionIds(_puzzleLevel);
        //assuming user passed verifyClaim
        _incrementUserPuzzlePieces(_receiver, _puzzleLevel);
        //return the collection to mint
        return(uint8(puzzleCollectionIds[_random()]));
    }


    ///GETTERS
    //Function to get how many puzzle pieces a user has from current level
    function getUserPuzzlePiecesForUserCurrentLevel(
        address _user
    ) public view returns (uint256) {
        return getPositionXInDivisionByY(userPuzzlePieces[_user], _whichLevelUserHas(_user), 3);
    }

    //Get minimum claim amount per level
    function getMinClaimAmount( 
        uint256 _level
    ) public view returns (uint256) {
        return getPositionXInDivisionByY(MIN_CLAIM_AMOUNT, _level, 5);
    }




}