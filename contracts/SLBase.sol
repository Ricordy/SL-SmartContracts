// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./SLMicroSlots.sol";
import "./SLPermissions.sol";

interface IFactory {
    function getAddressTotal(address user) external view returns(uint userTotal);
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
    uint256 COLLECTION_IDS = 3130292827262524232221201918171615141312111009080706050403020100;
    //Array to store the Puzzles batchs 
    uint24[] ENTRY_IDS;
    //Variable to store the minimum claim amount
    uint32 MIN_CLAIM_AMOUNT_LEVEL_1 = 5000;
    //Mapping to tack user puzzle pieces 
    mapping(address => uint32) userPuzzlePieces;


    address factoryAddress;
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
        
        uint8 collectionToMint = _dealWithPuzzleClaiming(_receiver ,_puzzleLevel); //Burn puzzle pieces
        _transferTokensOnClaim(_receiver, collectionToMint, 1); //Transfer tokens to user
        
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

    function _dealWithPuzzleClaiming(
        address _receiver,
        uint256 _puzzleLevel
    ) internal virtual returns (uint8 _collectionToMint) {
        //Helper Arrays
        uint256[] memory puzzleCollectionIds = _getPuzzleCollectionIds(_puzzleLevel);
        //assuming user passed verifyClaim
        _incrementUserPuzzlePieces(_receiver, _puzzleLevel);
        //return the collection to mint
        return(uint8(puzzleCollectionIds[_random()]));
    }
       
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

    // Function to verify if user has the right to claim the next level (to be replaced)
    function _userAllowedToBurnPuzzle(
        address user, 
        uint _tokenId
    ) internal virtual view {}

     /// INTERNAL NON-OVERRIDE FUNCTIONS

    //function to increment user puzzle pieces using SLMicroSlots
    function _incrementUserPuzzlePieces(
        address _user, 
        uint256 _puzzleLevel
    ) private {
        userPuzzlePieces[_user] = incrementXPositionInFactor3(userPuzzlePieces[_user], uint32(_puzzleLevel));
    }

    function _transferTokensOnClaim(
        address _receiver,
        uint256 _tokenId,
        uint256 _quantity
    ) internal {
        _mint(_receiver, _tokenId, _quantity, "");
    }



    ///GETTERS

    //Function to verify if the user has an entry token returns boolean
    function _userHasEntryToken(
        address _user
    ) internal view returns (bool) {
        //Get the entry token ids
        uint256[] memory entryTokenIds = _getEntryTokenIds();
        //Get the balance of the user for each entry token id
        uint256[] memory userBalance = balanceOfBatch(_createUserAddressArray(_user, entryTokenIds.length), entryTokenIds);
        //Verify if the user has any entry token
        for(uint i = 0; i < userBalance.length; i++) {
            if(userBalance[i] > 0) {
                return true;
            }
        }
        return false;   
    }

    //function to get entry token ids
    function _getEntryTokenIds(
    ) internal view returns (uint256[] memory) {
        uint256[] memory entryTokenIds = new uint256[](ENTRY_IDS.length);
        for(uint i = 0; i < ENTRY_IDS.length; i++) {
            //i is the batch number
            //get the entry token cap to mount the entry token id
            (uint256 entryTokenCap, ) = unmountEntryValue(ENTRY_IDS[i]);
            entryTokenIds[i] = mountEntryID(i, entryTokenCap);
        }
        return entryTokenIds;
    }

        //funtion to get puzzle collection ids
    function _getPuzzleCollectionIds(
        uint256 level
    ) public view returns(uint256[] memory) {
        uint256[] memory ids = new uint256[](10);
        if(level == 1) {
            ids = getMultiplePositionsXInDivisionByY(COLLECTION_IDS, 1, 10, 2);
        } else if (level == 2) {
            ids = getMultiplePositionsXInDivisionByY(COLLECTION_IDS, 11, 20, 2);
        } else if (level == 3) {
            ids = getMultiplePositionsXInDivisionByY(COLLECTION_IDS, 21, 30, 2);
        } else {
            revert("Not a valid puzzle level");
        }
        return ids;
    }

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



