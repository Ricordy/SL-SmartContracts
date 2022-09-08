// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";


import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract NFTPuzzle is ERC721Enumerable, Ownable, ReentrancyGuard {

        /*
        
        GLOBAL VARIABLES 

        */


       //VRFCoordinatorV2Interface COORDINATOR;


       uint256 MAX_LOT = 10000;
       uint256 reserved_owner = 10;
       uint256 reservedForFree = 100;
       uint256 private tokenID = 0;
       uint256 price = 0.0001 ether;
       uint256 max_per_mint = 100;
       uint256 requestCounter = 0;
       uint256 internal fee = 0.1 * 10**18;
       uint256 public s_requestId;
       string base_uri;
       bool isRevealed = false;
       address currentUser;
       address[] whiteListContracts;


      uint256[] randomNumber;
      uint256[] userTokenIds;
      uint64 subID = 21053;
      uint32 callbackGasLimit = 100000;
      uint32 numWords;
      bytes32 internal keyHash = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;
      uint16 requestConfirmations = 3;


   
       
       
      event UserBalance(
        uint256[] 
      );





       



       /*

        CONSTRUCTOR

       */

      constructor(string memory _base_uri, address vrfCoordinator) ERC721("Legendary Puzzle","LGP") 
      {
        //COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        base_uri = _base_uri;
      }




      /*

      MINT FUNCTIONS

      */

    function mintAll(uint256 _amount) private 
    {
      //currentUser = msg.sender;
      //numWords = _amount;
      for(uint i = 0; i < _amount; i++){
        tokenID++;
        _mint(msg.sender,tokenID);


      }
      //requestRandomWords();
    }



      /*

      DEV FUNCTIONS

      */

      function reveal(string memory _base_uri) external onlyOwner 
      {
        base_uri = _base_uri;
        isRevealed = true;
      }

      function tokenURI(uint256 tokenId) public view override returns (string memory)
      {
        if(isRevealed)
        {
          string memory _post_uri = string(abi.encodePacked(base_uri ,'/', Strings.toString(tokenId),".json"));
          return _post_uri ;
        } else 
        {
          return base_uri;
        }
      }



      /*

        MINT FUNCTIONS

      */



    function mintForAll(uint256 _amount) external payable nonReentrant {
        require (MAX_LOT >= (_amount + reserved_owner + tokenID),"Collection mint ended");
        if(msg.sender == owner() && balanceOf(owner()) + _amount < reserved_owner ) {
            mintAll(_amount);
        } else if (tokenID < reservedForFree)
        {
            require( _amount <= max_per_mint, "Too much tokens" );
            mintAll(_amount);
        } else 
        {
            require( _amount <= max_per_mint, "Too much tokens" );
            require(msg.value == _amount * price, "Not correct ether amount");
            mintAll(_amount);

        }
    }



  /*

    OVERRIDES

  */

 /*

  function requestRandomWords() internal  
  {
    // Will revert if subscription is not set and funded.
    s_requestId = COORDINATOR.requestRandomWords(
      keyHash,
      subID,
      requestConfirmations,
      callbackGasLimit,
      numWords
    );
  }

    function fulfillRandomWords(uint256,  uint256[] memory randomWords) internal override 
    {
      for(uint i = 0; i < randomWords.length; i++){

        //randomNumber.push(randomWords[i] % 30 + 1);
        
        _safeMint(currentUser,(randomWords[i] % 30 + 1));

      }
    
    
  }


  function getRandomNumber() external view returns (uint256[] memory)
  {
    return randomNumber;
  }

*/





/*

COMUNICATION FUNCTIONS

*/

  function burnForClaim(uint256[] memory tokenIds) external _onlyWhiteListContracts nonReentrant returns(bool) {
    for(uint i = 0; i < tokenIds.length; i++){
      _burn(i);
      require(!_exists(i), "not able to burn token");
    }
    return true;
  }

  function addressInfo(address _address) external _onlyWhiteListContracts returns(uint256 _amount /* Address total tokens amount*/, uint256[] memory _tokenIds /*All address token ids sotred in array */){
    _amount = balanceOf(_address);
    
  //return (_amount,getBalnceUser(_address,_amount));
  }






/*

MODIFIERS

*/


  modifier  _onlyWhiteListContracts {
    for(uint i = 0; i < whiteListContracts.length; i++){
      if(msg.sender == whiteListContracts[i]){
        _;
      }
    }
  }


  /*

  CONTRACTS WHITELIST FUNCTIONS

  */

 function addContractToWhitelist(address _address) public onlyOwner {
  whiteListContracts.push(_address);
 }


 function getBalnceUser(address _address, uint256 _amount) external returns(uint256[] memory){

  for(uint i = 0; i < _amount; i++){
    randomNumber.push(tokenOfOwnerByIndex(_address, i));
  }
  emit UserBalance(randomNumber);
  return(randomNumber);
 }











}