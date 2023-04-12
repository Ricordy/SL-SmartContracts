pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./SLMicroSlots.sol";
import "./SLPermissions.sol";

interface IFactory {
    function getAddressTotal(address user) external view returns(uint userTotal);
    function getAddressTotalInLevel(address user, uint level) external view returns(uint userTotal);
}

/// @title Base contract for SL puzzle management
/// @author The name of the author
/// @notice Centralizes information on this contract, making sure that all of the ERC1155 communications and 
/// memory writting calls happens thorugh here!
/// @dev Extra details about storage: https://app.diagrams.net/#G1Wi7A1SK0y8F9X-XDm65IUdfRJ81Fo7bF
contract SLLogics is ERC20, ReentrancyGuard, SLMicroSlots, SLPermissions {

    address factoryAddress;
    address paymentTokenAddress;
    //Uint to store minimum claim amount for all levels and the entry price
    uint256 MIN_CLAIM_AMOUNT_AND_ENTRY_PRICE = 100150001000005000;

    constructor (address _factoryAddress, address _paymentTokenAddress) ERC20("", ""){
        require(_factoryAddress != address(0) && _paymentTokenAddress != address(0), "SLLogics: Re-check input parameters");

        // the creator of the contract is the initial CEO
        ceoAddress = msg.sender;

        // the creator of the contract is also the initial COO
        cfoAddress = msg.sender;
        factoryAddress = _factoryAddress;
        paymentTokenAddress = _paymentTokenAddress;
    }

    ///EVENTS
    //Tokens Withdrawn
    event TokensWithdrawn(
        address indexed withdrawer,
        uint256 indexed tokenId,
        uint256 quantity
    );

    ///ENTRY PAYMENT
    //Function to pay the entry fee
    function payEntryFee(
        address _user
    ) external onlyAllowedContracts nonReentrant {
        require(IERC20(paymentTokenAddress).transferFrom(_user, address(this), _getEntryPrice()), "SLLOGIC: Transfer failed");
    }

    ///WITHDRAW FUNCTION
    //Function to withdraw tokens to the caller, this must be the CEO
    function withdrawTokens(
        address _user
    ) external onlyCEO {
        //Transfer tokens to the user
        IERC20 paymentToken = IERC20(paymentTokenAddress);
        require(paymentToken.transfer(_user, paymentToken.balanceOf(address(this))), "SLLogics: Transfer incompleted");
        //Emit event

    }



    ///CHECKER FOR PIECE CLAIMING
    // Function to verify if user has the right to claim the next level
    function _userAllowedToClaimPiece(
        address user, 
        uint _tokenId,
        uint _currentUserLevel,
        uint _userPuzzlePiecesForUserCurrentLevel
    ) external view {
        //Check if user has the right to claim the next level
        require(_currentUserLevel == _tokenId, "SLLogics: User does not have the right to claim piece from this level");
        //Check if user is allowed to claim more pieces in current level
        require(_userPuzzlePiecesForUserCurrentLevel < 999, "SLLogics: User has already claimed the max amount of pieces for this level");
        //Check if user has the right amount of puzzle pieces
        IFactory factory = IFactory(factoryAddress);
        uint256 allowedToMint = (factory.getAddressTotalInLevel(user, _tokenId)/ 10 ** 6) / getMinClaimAmount(_tokenId);
        require((_userPuzzlePiecesForUserCurrentLevel + 1) <= allowedToMint); 
    }

    ///SETTERS
    //function to set the entry price
    //function to rewrite the price of the entry token
    function setEntryPrice(
        uint256 _newPrice
    ) external onlyAllowedContracts {
        MIN_CLAIM_AMOUNT_AND_ENTRY_PRICE = changetXPositionInFactor5(MIN_CLAIM_AMOUNT_AND_ENTRY_PRICE, 4, _newPrice);
    }
    ///GETTERS

    //function to get entry price
    function _getEntryPrice(
    ) public view returns (uint256) {
        return getPositionXInDivisionByY(MIN_CLAIM_AMOUNT_AND_ENTRY_PRICE, 4, 5);
    }

     //Get minimum claim amount per level
    function getMinClaimAmount( 
        uint256 _level
    ) public view returns (uint256) {
        require(_level == 1 || _level == 2 || _level == 3, "SLPuzzles: Not a valid puzzle level");
        return getPositionXInDivisionByY(MIN_CLAIM_AMOUNT_AND_ENTRY_PRICE, _level, 5);
    }




        
    


}
