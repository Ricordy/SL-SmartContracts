//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISLCore {
    function whichLevelUserHas(address user) external view returns (uint256);

    function mintEntry() external;

    function mintTest(uint256 _level) external;

    function claimPiece() external;

    function claimLevel() external;
}
