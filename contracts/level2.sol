// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;



import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

interface INFTPuzzle{

    function getUserTokenIds(address _address) external returns(uint256[] memory);

    function burn(uint256[] calldata tokenIds) external returns (bool);

    
}

contract Level2Legendary is  Ownable, ReentrancyGuard, ERC721Enumerable{


    
    
    ///
    //-----STATE VARIABLES------
    ///
            //-----INTERFACE------
    INFTPuzzle _NFTPuzzle;
            //-----GENERAL------
    uint256 maxAmount;
    uint256 maxUserAmount;
    uint256 maxPerTransaction = 1;
            //-----RESERVED------
    uint256 reservedForOwner;
            //-----CURRENTID------
    uint256 internal tokenID = 0;
            //-----URI------
    string private base_uri;
    bool isRevealed;
            //-----CHHECKER FOR EACH ADDRESS------
    mapping(address => mapping(uint256 => bool)) checked;
            //-----COMUNICATION ADDRESS------
    address nftPuzzleContractAddress;
    
    
    ///
    //-----CONSTRUCTOR------
    ///
    constructor(uint256 _maxAmount, uint256 _maxUserAmount ,uint256 _reservedForOwner, string memory _baseURI, address _nftPuzzleContractAddress) 
    ERC721("Level2Legendary", "LVL2")
    {
        nftPuzzleContractAddress = _nftPuzzleContractAddress;
        maxAmount = _maxAmount;
        maxUserAmount = _maxUserAmount;
        reservedForOwner = _reservedForOwner;
        base_uri = _baseURI;
    }

    ///
    //-----EVENTS------
    ///
    event UserInfo
    (
        uint256[] tokenIDs
    );

    event TokenBurned
    (
        uint256[] tokenID
    );

    event NummberChecked
    (
        uint number
    );

    ///
    //-----LOGIC------
    ///
    function claim() public nonReentrant 
    {
        uint256[] memory tokenIds = getUserAmount(msg.sender);
        
        require(checkDifferents(tokenIds), "Not differents");
        require(INFTPuzzle(nftPuzzleContractAddress).burn(tokenIds), "Not able to burn");
        
        
        
        emit TokenBurned(tokenIds);
        tokenID++;
        _mint(msg.sender ,tokenID);
        

    }

    function checkDifferents(uint256[] memory userTokenIndexes) internal  returns(bool)
    {
        
        //require(_userAmount == 10, "Not exactly 10 tokens.");
        for(uint i = 0; i < userTokenIndexes.length; i++)
        {
            uint checking = userTokenIndexes[i] % 10 + 1;
            emit NummberChecked(checking);
            if(checked[msg.sender][checking] == true)
            {
                return false;
            }
            checked[msg.sender][checking] = true;

  
        }


        return true;

    }

    ///
    //-----FOR TESTS------
    ///
    function getUserAmount(address _address) public returns(uint256[] memory) 
    {
        (uint256[] memory _userTokenIds) = INFTPuzzle(nftPuzzleContractAddress).getUserTokenIds(_address);
        emit UserInfo(_userTokenIds);

        return _userTokenIds;
    } 

    ///
    //-----URI------
    ///
    function reveal(string memory _base_uri) external onlyOwner 
    {
        base_uri = _base_uri;
        isRevealed = true;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory)
    {
        if (isRevealed) 
        {
            string memory _post_uri = string(
                abi.encodePacked(
                    base_uri,
                    "/",
                    Strings.toString(tokenId),
                    ".json"
                )
            );
            return _post_uri;
        } 
        else 
        {
            return base_uri;
        }
    }


}


