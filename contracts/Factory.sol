// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Investment.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Factory is Ownable {

    Investment[] deployed;
    address lgentry;
    uint public counter;

    event ContractCreated (
        uint256 ContractID,
        address conAddress
    );
    constructor() {
    }

    function deployNew(uint256 _totalInvestment, address _paymentTokenAddress, address _paymentTokenAddress2 ) onlyOwner external returns (address) {
        counter++;
        Investment inv = new Investment(_totalInvestment, lgentry, _paymentTokenAddress, _paymentTokenAddress2);
        inv.transferOwnership(msg.sender);

        deployed.push(inv);
        // console.log('Contract created',address(inv));
        // console.log(msg.sender);
        emit ContractCreated(counter, address(inv));
        return address(inv);
    }

    function getAddressTotal(address user) external view returns(uint userTotal){
        for(uint i; i < deployed.length; i++){
            userTotal += ERC20(deployed[i]).balanceOf(user);
        }
    }

    function getAddressOnContract(address contractAddress) external view returns(uint userTotal){
            userTotal = ERC20(contractAddress).balanceOf(msg.sender);
    }

    function setEntryAddress(address _lgentry) external onlyOwner {
        lgentry= _lgentry;
    }

    function getLastDeployedContract() external view returns(address contractAddress) {
        if (deployed.length > 0) {
            contractAddress = address(deployed[deployed.length -1]);
        } else {
            contractAddress = address(0);
        }
    }
}