// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SLLevels.sol";

/// @title SLPuzzles
/// @author Something Legendary
/// @notice Manages levels
contract SLPuzzles is SLLevels {
    ///
    //--------------------OVERWRITTEN FUNCTIONS-------------------
    ///

    ///Added computation of the user level so user doesnt input his level when claiming
    /// @inheritdoc	ASLBase
    function verifyClaim(
        address _claimer,
        uint256 _tokenIdOrPuzzleLevel
    ) public view override {
        //Check if given piece is a puzzle piece or a level
        if (_tokenIdOrPuzzleLevel == 31 || _tokenIdOrPuzzleLevel == 30) {
            //Check if user has the ability to burn the puzzle piece
            _userAllowedToBurnPuzzle(_claimer, _tokenIdOrPuzzleLevel);
        } else if (
            _tokenIdOrPuzzleLevel == 1 ||
            _tokenIdOrPuzzleLevel == 2 ||
            _tokenIdOrPuzzleLevel == 3
        ) {
            //Check if user has the ability to burn the puzzle piece
            ISLLogics(slLogicsAddress)._userAllowedToClaimPiece(
                _claimer,
                _tokenIdOrPuzzleLevel,
                _whichLevelUserHas(_claimer),
                getUserPuzzlePiecesForUserCurrentLevel(
                    _claimer,
                    _whichLevelUserHas(_claimer)
                )
            );
        } else {
            revert("Not a valid id");
        }
    }

    /// @inheritdoc	ASLBase
    function _random() public view override returns (uint8) {
        return
            uint8(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            block.timestamp,
                            block.difficulty,
                            msg.sender
                        )
                    )
                ) % 10
            );
    }

    /// @inheritdoc	ASLBase
    function _getPuzzleCollectionIds(
        uint256 level
    ) public pure override returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](10);
        if (level == 1) {
            ids = getMultiplePositionsXInDivisionByY(COLLECTION_IDS, 1, 10, 2);
        } else if (level == 2) {
            ids = getMultiplePositionsXInDivisionByY(COLLECTION_IDS, 11, 10, 2);
        } else if (level == 3) {
            ids = getMultiplePositionsXInDivisionByY(COLLECTION_IDS, 21, 10, 2);
        } else {
            revert InvalidLevel(level, 1, 3);
        }
        return ids;
    }

    /// @inheritdoc	ASLBase
    function _dealWithPuzzleClaiming(
        address _receiver,
        uint256 _puzzleLevel
    ) internal override returns (uint8 _collectionToMint) {
        //assuming user passed verifyClaim
        _incrementUserPuzzlePieces(_receiver, _puzzleLevel);
        //return the collection to mint
        return (uint8(_getPuzzleCollectionIds(_puzzleLevel)[_random()]));
    }

    ///
    //---------------------------------GETTERS------------------------------
    ///
    //Function to get how many puzzle pieces a user has from current level
    /// @notice Function to get how many puzzle pieces a user has from current level
    /// @dev If user is given a piece by transfer, it will not count as claimed piece
    /// @param _user user's address
    /// @param level the specified level
    /// @return uint256 number of pieces
    function getUserPuzzlePiecesForUserCurrentLevel(
        address _user,
        uint256 level
    ) public view returns (uint256) {
        return getPositionXInDivisionByY(userPuzzlePieces[_user], level, 3);
    }
}
