// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NFT is ERC721 , Ownable , ReentrancyGuard{



    /*

    VARIABLES  

    */

    uint256 price;
    uint256 maxPerMint;
    uint256 maxAmount;
    uint256 maxUserAmount;
    uint256 reservedForOwner;
    uint256 reservedForFree;
    uint256 internal tokenID;


    string private base_uri_not_revealed;
    string private base_uri;



    bool isReaveled = false;

    mapping (address => uint256) walletsWithToken;


    /*

    CONSTRUCTOR

    */

    constructor(uint256 _price, uint256 _maxPerMint, uint256 _maxAmount, uint256 _reservedForOwner, uint256 _reservedForFree, uint256 _maxUserAmount, string memory _base_uri) ERC721("LegenEnty", "LGE")
    {
      price = _price;
      maxPerMint = _maxPerMint;
      maxAmount = _maxAmount;
      reservedForOwner = _reservedForOwner;     
      reservedForFree = _reservedForFree;
      maxUserAmount = _maxUserAmount;
      base_uri_not_revealed = _base_uri;
    }



    function mintForAll(uint256 _amount) external payable nonReentrant {
        require (maxAmount >= (_amount + reservedForOwner + tokenID),"Collection mint ended");
       
        if(msg.sender == owner() && walletsWithToken[owner()] + _amount < reservedForOwner) {
            walletsWithToken[owner()] += _amount;
            for(uint i = 0; i < _amount; i++)
            {
            mintAll();
            }
           


        } else if (tokenID < reservedForFree)
        {
            require(walletsWithToken[msg.sender] + _amount <= maxUserAmount, "Address not allowed to mint more tokens" );
            walletsWithToken[msg.sender] += _amount;
            mintAll();
        } else 
        {
            require(walletsWithToken[msg.sender] + _amount <= maxUserAmount, "Address not allowed to mint more tokens" );
            require(msg.value == _amount * price, "Not correct ether amount");
            walletsWithToken[msg.sender] += _amount;
            mintAll();

        }

    }



    /*

    MINT FUNCTIONS

    */

   function mintAll() private
   {
    tokenID += 1;
    _safeMint(msg.sender, tokenID);
   }


   /*

    DEV FUNCTIONS  

   */

  function setBaseUri (string calldata _baseURI) external onlyOwner {
    base_uri = _baseURI;
  }


  function tokenURI(uint256 tokenId) public view override returns (string memory)
  {
    if(isReaveled)
    {
      string memory _post_uri = string(abi.encodePacked(base_uri ,'/', Strings.toString(tokenId),".json"));
      return _post_uri ;
    } else 
    {
      return base_uri_not_revealed;
    }
  }


  function reveal() external onlyOwner {
    isReaveled = true;
  }




}
