// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CoinTest is ERC20 {

    constructor () ERC20("TestCoinSL", "tst"){
        
    }


    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }


}


