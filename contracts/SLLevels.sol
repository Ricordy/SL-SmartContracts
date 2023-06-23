// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SLBase.sol";

/// @title SLLevels
/// @author Something Legendary
/// @notice contract that manages levels
contract SLLevels is SLBase {
    /// @notice Function to deal with data of buying a new NFT entry token
    /// @dev Call the function and add needed logic (Payment, etc)
    /// @param _receiver buyer
    function _buyEntryToken(address _receiver) internal {
        require(entryIdsArray.length != 0, "SLLevels: No entry batchs created");
        require(
            getCurrentEntryBatchRemainingTokens() != 0,
            "SLLevels: No entry tokens available in current batch"
        );
        //get the current entry batch number
        uint256 batch = entryIdsArray.length - 1;
        //Get the entry token cap and currentID
        (
            uint256 entryTokenCap,
            uint256 entryTokenCurrentId
        ) = unmountEntryValue(entryIdsArray[batch]);
        //Verify if the entry token is still available
        require(
            entryTokenCurrentId < entryTokenCap,
            "SLLevels: Entry token is not available"
        );
        //Increment the entry token current id
        entryIdsArray[batch] = mountEntryValue(
            entryTokenCap,
            entryTokenCurrentId + 1
        );
        //Mint the entry token to the user
        _transferTokensOnClaim(
            _receiver,
            mountEntryID(batch, entryTokenCap),
            1
        );
        emit TokensClaimed(_receiver, mountEntryID(batch, entryTokenCap));
    }

    ///
    //--------------------OVERWRITTEN FUNCTIONS-------------------
    ///

    /// Added logic that verifies the possibility of passing the level
    /// @inheritdoc	SLBase
    function _userAllowedToBurnPuzzle(
        address _claimer,
        uint256 _tokenId
    ) public view override {
        //Helper Arrays
        address[] memory userAddress = _createUserAddressArray(_claimer, 10);
        uint256[] memory amountsForBurn = new uint256[](10);
        uint256[] memory balance;
        //Fill needed arrays
        for (uint256 i; i < amountsForBurn.length; ++i) {
            amountsForBurn[i] = 1;
        }
        //Puzzle verification for passing to level2
        if (_tokenId == 30) {
            //Check for user level token ownership
            require(
                balanceOf(_claimer, _tokenId) == 0,
                "User already has the LEVEL2 NFT"
            );
            //Get balance of the user
            balance = balanceOfBatch(userAddress, _getPuzzleCollectionIds(1));
            //verify if balance meets the condition
            for (uint256 i; i < balance.length; ++i) {
                require(
                    balance[i] != 0,
                    "SLLevels: User must have all Level1 pieces"
                );
            }
            //Puzzle verification for passing to level3
        } else if (_tokenId == 31) {
            //Check for user level token ownership
            require(
                balanceOf(_claimer, _tokenId) == 0,
                "User already has the LEVEL2 NFT"
            );
            //Get balance of the user
            balance = balanceOfBatch(userAddress, _getPuzzleCollectionIds(2));
            //verify if balance meets the condition
            for (uint256 i; i < balance.length; ++i) {
                require(
                    balance[i] != 0,
                    "SLLevels: User must have all Level2 pieces"
                );
            }
        } else {
            //revert is for some reason the ID is not Level2 or 3 ID
            revert("Not a valid level token ID");
        }
    }

    /// @inheritdoc	SLBase
    function _getLevelTokenIds(
        uint256 _level
    ) internal view override returns (uint256[] memory) {
        if (_level == 1) {
            uint256[] memory entryTokenIds = new uint256[](
                entryIdsArray.length
            );
            for (uint256 i; i < entryIdsArray.length; ++i) {
                //i is the batch number
                //get the entry token cap to mount the entry token id
                (uint256 entryTokenCap, ) = unmountEntryValue(entryIdsArray[i]);
                entryTokenIds[i] = mountEntryID(i, entryTokenCap);
            }
            return entryTokenIds;
        } else if (_level == 2 || _level == 3) {
            uint256[] memory level2And3Ids = new uint256[](2);
            level2And3Ids[0] = 30;
            level2And3Ids[1] = 31;
            return level2And3Ids;
        }
    }

    ///
    //-------------------INTERNAL FUNCTIONS-------------------
    ///

    /// @notice check users level
    /// @dev checks based on NFT balance, so the users are able to trade privileges
    /// @param _user user's address
    /// @return uint256 users level
    function _whichLevelUserHas(address _user) internal view returns (uint256) {
        //check if user has level 2 or 3
        //call function to check user balance of token id 30 and 31

        //Verify level 2 and 3 token ownership
        if (balanceOf(_user, 31) != 0) {
            return 3;
        } else if (balanceOf(_user, 30) != 0) {
            return 2;
        } else {
            //If user doesnt have level 2 or 3, check if user has entry token
            //Get the balance of the user for each entry token id
            uint256[] memory userBalance = balanceOfBatch(
                _createUserAddressArray(_user, _getLevelTokenIds(1).length),
                _getLevelTokenIds(1)
            );
            //Verify if the user has any entry token
            for (uint256 i; i < userBalance.length; ++i) {
                if (userBalance[i] != 0) {
                    return 1;
                }
            }
            return 0;
        }
    }

    /// @notice check users level
    /// @dev checks based on NFT balance, so the users are able to trade privileges
    /// @param _user user's address
    /// @return uint256 users level
    function whichLevelUserHas(address _user) external view returns (uint256) {
        return (_whichLevelUserHas(_user));
    }

    ///
    //------------------GETTERS--------------------
    ///
    /// @notice get remaining tokens for current batch
    /// @dev uses SLMicroSlots to have access to such information
    /// @return uint256 tokens left
    function getCurrentEntryBatchRemainingTokens()
        public
        view
        returns (uint256)
    {
        (
            uint256 entryTokenCap,
            uint256 entryTokenCurrentId
        ) = unmountEntryValue(entryIdsArray[entryIdsArray.length - 1]);
        return (entryTokenCap - entryTokenCurrentId);
    }

    ////
    //------------------MODIFIERS--------------------
    ///
    /// @notice Verifies if user has the necessary NFT to interact with the function.
    /// @dev User should be at least the same level as the the reuqired by the function
    modifier userHasLevel(uint256 _level) {
        //use _whichLevelUserHas to check if user has the level
        require(
            _whichLevelUserHas(msg.sender) >= _level,
            "SLLevels: User doesnt have the level"
        );
        _;
    }
}
