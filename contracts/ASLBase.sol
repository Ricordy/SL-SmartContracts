// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract ASLBase {
    /// @notice Verifies if user can claim given piece or level NFT
    /// @dev Override the verify claim function to check if user has the right to claim the next level or puzzle piece
    /// @param _claimer the user's address
    /// @param _tokenIdOrPuzzleLevel The token id of the level (30 or 30) or LEvel of the piece (1,2,3)
    function verifyClaim(
        address _claimer,
        uint256 _tokenIdOrPuzzleLevel
    ) public view virtual;

    /// @notice returns random number
    function _random() public view virtual returns (uint8);

    /// @notice Function that verifies if user is allowed to pass to the next level
    /// @dev function have no return, it should fail if user is not allowed to burn
    /// @param _claimer the user's address
    /// @param _levelId The id of piece's level (lvl 2->30, lvl3->31)
    function _userAllowedToBurnPuzzle(
        address _claimer,
        uint256 _levelId
    ) public view virtual;

    /// @notice funtion that returns the level token ids
    /// @dev should be overriden
    /// @param level the level that we want the token IDs
    /// @return uint256[] memory with ids for level 2 and 3 (30,31) or all level 1 collection ids
    function _getLevelTokenIds(
        uint256 level
    ) public view virtual returns (uint256[] memory);

    /// @notice funtion that returns the puzzle pieces for a specified level
    /// @dev should be overriden
    /// @param level the level that we want the token IDs
    /// @return uint256[] memory with 10 ids for 10 pieces
    function _getPuzzleCollectionIds(
        uint256 level
    ) public view virtual returns (uint256[] memory);

    /// @notice Function that defines which piece is going to be minted
    /// @dev Override to implement puzzle piece claiming logic
    /// @param _receiver the user's address
    /// @param _puzzleLevel The level of the piece (1,2,3)
    /// @return _collectionToMint the collection from which the piece is going to be minted
    function _dealWithPuzzleClaiming(
        address _receiver,
        uint256 _puzzleLevel
    ) internal virtual returns (uint8 _collectionToMint);
}
