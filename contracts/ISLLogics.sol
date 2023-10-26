// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISLLogics {
    function _userAllowedToClaimPiece(
        address user,
        uint256 _tokenId,
        uint256 _currentUserLevel,
        uint256 _userPuzzlePiecesForUserCurrentLevel
    ) external view;

    function payEntryFee(address _user) external;

    function setEntryPrice(uint256 _newPrice, string memory tokenUri) external;

    function uri(uint256 _id) external view returns (string memory);
}
