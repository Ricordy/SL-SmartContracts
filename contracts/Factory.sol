// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Investment.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract Factory is Ownable {

    mapping(uint => Investment[]) public deployedContracts;    
    address lgentry;
    uint[] public counter = new uint[](3);

    event ContractCreated (
        uint256 ContractID,
        address conAddress
    );
    constructor() {
    }

    function deployNew(uint256 _totalInvestment, address _paymentTokenAddress, uint8 level) onlyOwner external returns (address) {
        require(lgentry != address(0), "Factory: First provide the entry contract address");
        require(_paymentTokenAddress != address(0), "Factory: Provide a real paymentTokenAddress");
        require(level > 0 && level <= 3, "Factory: Provide an existing level");
       
        counter[level]++;
        Investment inv = new Investment(_totalInvestment, lgentry, _paymentTokenAddress, level);
       
        deployedContracts[level].push(inv);
        emit ContractCreated(counter[level], address(inv));

        inv.transferOwnership(msg.sender);
       
       
        return address(inv);
    }

    function getAddressTotal(address user) external view returns(uint userTotal){
        for(uint i = 1; i <= 3 ; i++){
            for(uint j = 0; j < deployedContracts[i].length; j++){
                userTotal += ERC20(deployedContracts[i][j]).balanceOf(user);
            }
        }
    }

    function getAddressTotalInLevel(address user, uint level) external view returns(uint userTotal){
        for(uint i = 0; i < deployedContracts[level].length; i++){
            userTotal += ERC20(deployedContracts[level][i]).balanceOf(user);
        }
    }

    function getAddressOnContract(address contractAddress) external view returns(uint userTotal){
            userTotal = ERC20(contractAddress).balanceOf(msg.sender);
    }

    function setEntryAddress(address _lgentry) external onlyOwner {
        require(_lgentry != address(0), "Factory: Provide a real address in the parameters.");
        lgentry= _lgentry;
    }

    function getLastDeployedContract(uint level) external view returns(address contractAddress) {
        if (deployedContracts[level].length > 0) {
            contractAddress = address(deployedContracts[level][deployedContracts[level].length -1]);
        } else {
            contractAddress = address(0);
        }
    }
}