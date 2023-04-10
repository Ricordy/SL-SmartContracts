// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SLLevels.sol";

contract SLPuzzles is SLLevels{


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
        } else if (_tokenIdOrPuzzleLevel == 1 || _tokenIdOrPuzzleLevel == 2 || _tokenIdOrPuzzleLevel == 3) {
            //Check if user has the ability to burn the puzzle piece
            ISLLogics(slLogicsAddress)._userAllowedToClaimPiece(_claimer, _tokenIdOrPuzzleLevel, _whichLevelUserHas(_claimer) ,getUserPuzzlePiecesForUserCurrentLevel(_claimer));
        } else {
            revert("Not a valid puzzle level id  or puzzle level");
        }
    }

    function _random(
    ) public view override returns (uint8) {
        return uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % 10);

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
        //assuming user passed verifyClaim
        _incrementUserPuzzlePieces(_receiver, _puzzleLevel);
        //return the collection to mint
        return(uint8(_getPuzzleCollectionIds(_puzzleLevel)[_random()]));
    }


    ///GETTERS
    //Function to get how many puzzle pieces a user has from current level
    function getUserPuzzlePiecesForUserCurrentLevel(
        address _user
    ) public view returns (uint256) {
        return getPositionXInDivisionByY(userPuzzlePieces[_user], _whichLevelUserHas(_user), 3);
    }






}