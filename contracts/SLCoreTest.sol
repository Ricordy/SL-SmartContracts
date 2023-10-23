// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./SLCore.sol";

/// @title A contract to test SLCORE including the functions that are not coming in production
/// @author Someone Legendary
/// @notice This has the functions that are needed to test, but wont come in the production version
/// @dev Add functions here that help testing but have no other purpose.
contract SLCoreTest is SLCore {
    constructor(
        address _slLogicsAddress,
        address _slPermissionsAddress
    ) SLCore(_slLogicsAddress, _slPermissionsAddress) {}


    /// @notice Mints 10 unique NFT pieces for a given level to the caller
    /// @dev helps testing level 2 and 3 functions
    /// @param level the desired level 
    function mintTest(uint level) public {
        for (uint i = 0; i < 10; i++) {
            _mint(msg.sender, _getPuzzleCollectionIds(level)[i], 1, "");
            _incrementUserPuzzlePieces(msg.sender, level);
        }
    }
}
