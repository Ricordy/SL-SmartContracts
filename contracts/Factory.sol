// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Investment.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract Factory is Ownable {

    Investment[] public deployedContracts;
    address lgentry;
    uint public counter;

    event ContractCreated (
        uint256 ContractID,
        address conAddress
    );
    constructor() {
    }

    function deployNew(uint256 _totalInvestment, address _paymentTokenAddress) onlyOwner external returns (address) {
        counter++;
        Investment inv = new Investment(_totalInvestment, lgentry, _paymentTokenAddress);
        inv.transferOwnership(msg.sender);

        deployedContracts.push(inv);
        // console.log('Contract created',address(inv));
        // console.log(msg.sender);
        emit ContractCreated(counter, address(inv));
        return address(inv);
    }

    function getAddressTotal(address user) external view returns(uint userTotal){
        for(uint i; i < deployedContracts.length; i++){
            userTotal += ERC20(deployedContracts[i]).balanceOf(user);
        }
    }

    function getAddressOnContract(address contractAddress) external view returns(uint userTotal){
            userTotal = ERC20(contractAddress).balanceOf(msg.sender);
    }

    function setEntryAddress(address _lgentry) external onlyOwner {
        lgentry= _lgentry;
    }

    function getLastDeployedContract() external view returns(address contractAddress) {
        if (deployedContracts.length > 0) {
            contractAddress = address(deployedContracts[deployedContracts.length -1]);
        } else {
            contractAddress = address(0);
        }
    }
}