// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISLPermissions {
    function isCEO(address _address) external view returns (bool);

    function isCFO(address _address) external view returns (bool);

    function isCLevel(address _address) external view returns (bool);

    function isAllowedContract(address _address) external view returns (bool);

    function isPlatformPaused() external view returns (bool);

    function isInvestmentsPaused() external view returns (bool);

    function isPuzzleMintPaused() external view returns (bool);

    function isEntryMintPaused() external view returns (bool);
}
