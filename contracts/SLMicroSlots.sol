// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title SLMicroSlots
/// @author Something Legendary
/// @notice Computes numbers that are stored in slots inside uint256 values
/// @dev this contract doesnt set state, it should be used in the inherited one
contract SLMicroSlots {
    /// @notice Reverts if input is not in level range
    /// @param input inputed number
    /// @param max max input value
    error InvalidNumber(uint256 input, uint256 max);

    //Get a number of digits in x position of a number
    /// @notice Returns the position X in slots of Y size in a given number.
    /// @param number the uint256 from where the result is extracted
    /// @param position the psotion of the result
    /// @param factor number of algarisms in result
    /// @return uint256 the specified position in a number
    function getPositionXInDivisionByY(
        uint256 number,
        uint256 position,
        uint256 factor
    ) internal view returns (uint256) {
        return
            ((number % (10 ** (factor * position))) -
                (number % (10 ** ((factor * position) - factor)))) /
            (10 ** (position * factor - factor));
    }

    /// @notice Returns an array of X positions in slots of Y size in a given number.
    /// @param number the uint256 from where the result is extracted
    /// @param startPosition the position of the 1st element
    /// @param numberOfResults number of results needed
    /// @param factor number of algarisms in each result
    /// @return uint256 the specified position in a number
    function getMultiplePositionsXInDivisionByY(
        uint256 number,
        uint256 startPosition,
        uint256 numberOfResults,
        uint256 factor
    ) internal view returns (uint256[] memory) {
        uint256[] memory results = new uint256[](numberOfResults);
        for (uint256 i; i < numberOfResults; ++i) {
            results[i] = (
                getPositionXInDivisionByY(number, startPosition + i, factor)
            );
        }
        return results;
    }

    /// @notice mount the entry value for storage
    /// @dev currentID can never be more than 9999
    /// @param cap Collection limit
    /// @param currentID the current token Id
    /// @return uint24 the current information of the current lvl1 batch
    function mountEntryValue(
        uint256 cap,
        uint256 currentID
    ) internal view returns (uint24) {
        return uint24((cap * 10000) + currentID);
    }

    /// @notice unmount the entry value for checking
    /// @dev the returns allows checking for limit of NFT minting
    /// @param value the information regarding current level1 batch
    /// @return cap Collection limit
    /// @return currentID the current token Id
    function unmountEntryValue(
        uint24 value
    ) internal view returns (uint256 cap, uint256 currentID) {
        currentID = getPositionXInDivisionByY(value, 1, 4);
        cap = (value - currentID) / 10000;
    }

    /// @notice mount the entry ID for ERC1155 minting
    /// @dev entryID is defined with 2 static parameters of an entry batch, the batch number and the limit of minting
    /// @param batch the number of the collection of entry NFTs
    /// @param cap Collection limit
    /// @return uint256 the ID from which the specified batch should be minted
    function mountEntryID(
        uint256 batch,
        uint256 cap
    ) internal view returns (uint256) {
        return ((batch * 10000) + cap);
    }

    /// @notice unmount the entry ID
    /// @dev This allows to relationate the batch with its cap
    /// @param id the level1 batch ID that needs to be read
    /// @return batch the number of the collection of entry NFTs
    /// @return cap Collection limit
    function unmountEntryID(
        uint256 id
    ) public view returns (uint256 batch, uint256 cap) {
        cap = getPositionXInDivisionByY(id, 1, 4);
        batch = (id - cap) / 10000;
    }

    /// @notice Function to increment a parcel of the number by 1
    /// @dev if number gets to 999 next number will be 0. since it is using a factor of 3 number per parcel
    /// @param number the uint256 where the number is going to be incremented
    /// @param position the position for incrementing
    /// @return _final the number with the incremented parcel
    function incrementXPositionInFactor3(
        uint32 number,
        uint32 position
    ) public view returns (uint32 _final) {
        //Verify if digit is incrementable
        uint32 digit = uint32(getPositionXInDivisionByY(number, position, 3));
        if (digit == 999) {
            digit = 0;
        } else {
            digit++;
        }
        //remount the number with the incremented parcel
        _final = uint32(
            (number / 10 ** (position * 3)) *
                10 ** (position * 3) +
                digit *
                10 ** (position * 3 - 3) +
                (number % (10 ** (position * 3 - 3)))
        );
    }

    /// @notice Function to change a specific parcel of a number. -In parcels of 5 digits
    /// @dev Since it is using a facotr of 5, number cannot be bigger than 99999
    /// @param number the uint256 where the number is going to be replaced
    /// @param position the position for changing
    /// @param position the new parcel
    /// @return _final the number with the replaced parcel
    function changetXPositionInFactor5(
        uint256 number,
        uint32 position,
        uint256 newNumber
    ) public pure returns (uint256 _final) {
        //Verify if digit is incrementable
        if (newNumber > 99999) {
            revert InvalidNumber(newNumber, 99999);
        } else {
            //remount the number with new number using internal function
            _final =
                (number / 10 ** (position * 5)) *
                10 ** (position * 5) +
                newNumber *
                10 ** (position * 5 - 5) +
                (number % (10 ** (position * 5 - 5)));
        }
    }
}
