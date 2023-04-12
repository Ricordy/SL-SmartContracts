// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./SLMicroSlots.sol";
import "./SLPermissions.sol";

//interface for SLLogics
interface ISLLogics {
    function _userAllowedToClaimPiece(
        address user, 
        uint _tokenId,
        uint _currentUserLevel,
        uint _userPuzzlePiecesForUserCurrentLevel
    ) external view;

    function payEntryFee(
        address _user
    ) external;

     function setEntryPrice(
        uint256 _newPrice
    ) external;
}

/// @title Base contract for SL puzzle management
/// @author The name of the author
/// @notice Centralizes information on this contract, making sure that all of the ERC1155 communications and 
/// memory writting calls happens thorugh here!
/// @dev Extra details about storage: https://app.diagrams.net/#G1Wi7A1SK0y8F9X-XDm65IUdfRJ81Fo7bF
contract SLBase is ERC1155, ReentrancyGuard, SLMicroSlots, SLPermissions {

    //Mapping to store the Levels batchs 
    // mapping (uint => mapping (uint => uint)) Levels;
    //Mapping to store the Puzzles batchs 
    // mapping (uint => mapping (uint => mapping (uint=>uint))) Puzzles;
    
    //Array to store the Levels batchs 
    uint256 constant COLLECTION_IDS = 3130292827262524232221201918171615141312111009080706050403020100;
    //Array to store the Puzzles batchs 
    uint24[] ENTRY_IDS;
    //Mapping to tack user puzzle pieces 
    mapping(address => uint32) userPuzzlePieces;
    //address of the factory
    address factoryAddress;
    //Address of the SLLogics contract
    address slLogicsAddress;

    
    constructor () ERC1155("") {
        
    }

    event TokensClaimed(
        address indexed claimer,
        uint256 indexed tokenId,
        uint256 quantity
    );

    
    
    /// WRITTING FUNCTIONS
    function _claimLevel(
        address _receiver,
        uint256 _tokenId
    ) internal nonReentrant {
        require(_tokenId == 31 || _tokenId == 30, "SLBase: Not a valid level ID");
        verifyClaim(msg.sender, _tokenId); //Check if user has the right to claim the next level or puzzle piece
        
        _dealWithPuzzleBurning(_receiver ,_tokenId); //Burn puzzle pieces
        _transferTokensOnClaim(_receiver, _tokenId, 1); //Transfer tokens to user
        
        emit TokensClaimed(_receiver, _tokenId, 1);
    }

    function _claimPiece(
        address _receiver,
        uint256 _puzzleLevel
    ) internal nonReentrant {
        require(_puzzleLevel == 1 || _puzzleLevel == 2 || _puzzleLevel == 3, "SLBase: Not a valid puzzle level");
        verifyClaim(msg.sender, _puzzleLevel); //Check if user has the right to claim the next level or puzzle piece
        
        _transferTokensOnClaim(_receiver, _dealWithPuzzleClaiming(_receiver ,_puzzleLevel), 1); //Transfer tokens to user
        
        emit TokensClaimed(_receiver, _puzzleLevel, 1);
    }

    /// FUNCTIONS TO BE OVERRIDEN

    //Override the verify claim function to check if user has the right to claim the next level or puzzle piece
    function verifyClaim(
        address _claimer,
        uint256 _tokenIdOrPuzzleLevel
    ) public view  virtual {}

    //To be overriden
    function _random(
    ) public view virtual returns (uint8) {}

    /// INTERNAL OVERRIDE FUNCTIONS
    //Function to deal with puzzle claiming
    function _dealWithPuzzleClaiming(
        address _receiver,
        uint256 _puzzleLevel
    ) internal virtual returns (uint8 _collectionToMint) {}
       
    //Auxiliary function to burn user puzzle depending on his level
    function _dealWithPuzzleBurning(
        address user ,
        uint _tokenId
    ) private {
        //Helper Arrays
        uint256[] memory amountsForBurn = new uint256[](10);
        //Fill needed arrays
        for (uint i = 0; i < amountsForBurn.length; i++) {
            amountsForBurn[i] = 1;
        }
        //Puzzle verification for passing to level2
        if(_tokenId == 30) {
            //Burn user puzzle right away (so verify claim doesnt get to big)
            _burnBatch(user, _getPuzzleCollectionIds(1), amountsForBurn);
        //Puzzle verification for passing to level3
        } else if (_tokenId == 31) {
            _burnBatch(user, _getPuzzleCollectionIds(2), amountsForBurn);
        }
    }

    // Function to verify if user has the right to claim the next level
    function _userAllowedToBurnPuzzle(
        address user, 
        uint _tokenId
    ) internal virtual view {}
    
    /// INTERNAL NON-OVERRIDE FUNCTIONS
    //function to increment user puzzle pieces using SLMicroSlots
    function _incrementUserPuzzlePieces(
        address _user, 
        uint256 _puzzleLevel
    ) internal {
        userPuzzlePieces[_user] = incrementXPositionInFactor3(userPuzzlePieces[_user], uint32(_puzzleLevel));
    }

    //function to mint tokens on claim
    function _transferTokensOnClaim(
        address _receiver,
        uint256 _tokenId,
        uint256 _quantity
    ) internal {
        _mint(_receiver, _tokenId, _quantity, "");
    }


    ///GETTERS MOST OVERRIDEN
    //Function to verify if the user has an entry token returns boolean
    function _userHasEntryToken(
        address _user
    ) internal view virtual returns (bool) {}

    //function to get entry token ids
    function _getEntryTokenIds(
    ) internal view virtual returns (uint256[] memory) {}

        //funtion to get puzzle collection ids
    function _getPuzzleCollectionIds(
        uint256 level
    ) public view virtual returns(uint256[] memory) {}

        //function to retrieve level2 and level3 ids
    function _getLevel2And3Ids(
    ) internal pure virtual returns(uint256[] memory) {}

    //function to create a user address array with the given size 
    function _createUserAddressArray(
        address _user, 
        uint256 size
    ) internal pure returns(address[] memory) {
        address[] memory userAddress = new address[](size);
        for (uint i = 0; i < userAddress.length; i++) {
            userAddress[i] = _user;
        }
        return userAddress;
    }
    




}



