//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Investment is ERC20{




    constructor() ERC20("InvestmentCurrency", "IC"){

    }

    function Invest(uint256 _amount) public {
        require(_amount >= 100, "Minimum is 100" );
        ERC20(0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557).transferFrom(msg.sender, address(this), _amount);
    

    }

    function howMuch() public returns(uint256) {
        return balanceOf(msg.sender);

    }
}