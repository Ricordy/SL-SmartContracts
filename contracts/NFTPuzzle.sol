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
    uint256 MAX_LOT = 10000;
    uint256 reserved_owner = 10;
    uint256 reservedForFree = 100;
    uint256 max_per_mint = 100;

    uint256 private tokenID = 0;
    uint256 price = 0.0001 ether;

    bool isRevealed = false;
    string base_uri;

    mapping(address => bool) whiteListContracts;

    uint256[] randomNumber;
    uint256[] userTokenIds;

    /*

      EVENTS

    */
    event UserBalance(uint256[]);

    /*

      CONSTRUCTOR

    */

    constructor(string memory _base_uri) ERC721("Legendary Puzzle", "LGP") 
    {
        base_uri = _base_uri;
    }

    /*

      MINT FUNCTIONS

    */

    function mintForAll(uint256 _amount) external payable nonReentrant 
    {
        require(
            MAX_LOT >= (_amount + reserved_owner + tokenID),
            "Collection mint ended"
        );
        if (
            msg.sender == owner() &&
            balanceOf(owner()) + _amount < reserved_owner
        ) {
            mintAll(_amount);
        } else if (tokenID < reservedForFree) {
            require(_amount <= max_per_mint, "Too much tokens");
            mintAll(_amount);
        } else {
            require(_amount <= max_per_mint, "Too much tokens");
            require(msg.value == _amount * price, "Not correct ether amount");
            mintAll(_amount);
        }
    }

    function mintAll(uint256 _amount) private 
    {
        for (uint i = 0; i < _amount; i++) {
            tokenID++;
            _mint(msg.sender, tokenID);
        }
    }

    /*

      URI FUNCTIONS

    */

    function reveal(string memory _base_uri) external onlyOwner 
    {
        base_uri = _base_uri;
        isRevealed = true;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory)
    {
        if (isRevealed) {
            string memory _post_uri = string(
                abi.encodePacked(
                    base_uri,
                    "/",
                    Strings.toString(tokenId),
                    ".json"
                )
            );
            return _post_uri;
        } else {
            return base_uri;
        }
    }



    /*

      COMUNICATION FUNCTIONS

    */

    function getUserTokenIds(address _address) external returns (uint256[] memory)
    {
        for (uint i = 0; i < balanceOf(_address); i++) {
            randomNumber.push(tokenOfOwnerByIndex(_address, i));
        }
        emit UserBalance(randomNumber);
        return (randomNumber);
    }
    
    function burn(uint256 tokenIds) external returns (bool) 
    {
        _burn(tokenIds);
        return true;
    }

    /*

      CONTRACTS WHITELIST FUNCTIONS

    */

    function addContractToWhitelist(address _address) public onlyOwner 
    {
        whiteListContracts[_address] = true;
    }

    /*

      MODIFIERS

    */

    modifier _onlyWhiteListContracts() 
    {
        require(whiteListContracts[msg.sender] == true);
        _;
    }
}
