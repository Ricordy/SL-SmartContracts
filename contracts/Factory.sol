// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Investment.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract Factory is Ownable {


    Investment[] deployed;
    address lgentry;
    uint counter;



    event ContractCreated (
        uint256 ContractID/*,
        address conAddress*/
    );

    constructor() {
    }


    function deployNew(uint256 totalInvestment) public {
        counter++;
        Investment inv = new Investment(totalInvestment, lgentry, counter);
        deployed.push(inv);
        emit ContractCreated(counter/*, address(inv)*/);

        
    }

    function getAddressTotal(address user) public view returns(uint userTotal){
        for(uint i; i < deployed.length; i++){
            userTotal += ERC20(deployed[i]).balanceOf(user);
        }
    }

    function getAddressOnContract(address contractAddress) public view returns(uint userTotal){
            userTotal = ERC20(contractAddress).balanceOf(msg.sender);
    }

    function setEntryAddress(address _lgentry) public onlyOwner {
        lgentry= _lgentry;
    }

    /**
     * TEST FUNCTIONS
     */
    function getLastDeployedContract() public returns(address) {
        address test = address(deployed[deployed.length -1]);
        return test;
    }

}