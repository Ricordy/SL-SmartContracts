// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;
contract SLMicroSlots{

// TODO This contract needs modifiers for security 

    //Get digit in x position of a number
    function getXDigit(uint256 number, uint256 position) view public returns(uint){
        return getPositionXInDivisionByY(number, position, 1);
    }
    //Get a number of digits in x position of a number
    function getPositionXInDivisionByY(uint256 number, uint256 position, uint factor) view public returns(uint){
        return ((number % (10 ** (factor * position))) - (number % (10 ** ((factor * position) - factor)))) / (10 ** (position * factor - factor));
    }
    //get multiple digits in x position of a number
    function getMultiplePositionsXInDivisionByY(uint256 number, uint256 startPosition,uint numberOfResults ,uint factor) view public returns(uint[] memory){
        uint[] memory results;
        for (uint i = 0; i < numberOfResults; i++) {
            results[i] = (getPositionXInDivisionByY(number,startPosition+i, factor));
        }
        return results;
    }
    //get multiple digits in x position of a number
    function getPositionXInDivisionBy2(uint256 number, uint256 position) view public returns(uint){
        return getPositionXInDivisionByY(number, position, 2);
    }
    //mount entry value
    function mountEntryValue(uint cap, uint currentID) view public returns(uint24){
        return uint24((cap * 10000) + currentID);
    }
    //unmount entry value
    function unmountEntryValue(uint24 value) view public returns(uint cap, uint currentID){
        currentID = getPositionXInDivisionByY(value, 1, 4);
        cap = (value - currentID) / 10000;
    }
    function mountEntryID(uint batch, uint cap) view public returns(uint){
        return ((batch * 10000) + cap);
    }

    function unmountEntryID(uint id) view public returns(uint batch, uint cap){
        cap = getPositionXInDivisionByY(id, 1, 4);
        batch = (id - cap) / 10000;
    }

    //Function to increment a parcel of the number by 1
    function incrementXPositionInFactor3(uint32 number, uint32 position) view public returns(uint32 _final){
        //Verify if digit is incrementable
        uint32 digit = uint32(getPositionXInDivisionByY(number, position, 3));
        if(digit == 999){
            digit = 0;
        } else {
            digit++;
        }
        //remount the number with new number
        _final = uint32((number / 10 ** (position * 3)) * 10 ** (position * 3) + digit * 10 ** (position * 3 - 3) + (number % (10 ** (position * 3 - 3))));
    }
    
}