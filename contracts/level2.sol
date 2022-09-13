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


    INFTPuzzle _NFTPuzzle;



    uint256 maxAmount;
    uint256 maxUserAmount;
    uint256 reservedForOwner;
    uint256 internal tokenID;


    string private base_uri;
    bool isRevealed;


    address nftPuzzleContractAddress;
    uint8 maxPerTransaction = 1;
    

    constructor(uint256 _maxAmount, uint256 _maxUserAmount ,uint256 _reservedForOwner, string memory _baseURI, address _nftPuzzleContractAddress) 
    ERC721("Level2Legendary", "LVL2")
    {
        nftPuzzleContractAddress = _nftPuzzleContractAddress;
        maxAmount = _maxAmount;
        maxUserAmount = _maxUserAmount;
        reservedForOwner = _reservedForOwner;
        base_uri = _baseURI;
    }


    /*

    EVENTS FOR TESTING

    */
   
    event UserInfo
    (
        uint256[] tokenIDs
    );

    event TokenBurned
    (
        uint256[] tokenID
    );


    /*

    LOGICAL FUNCTIONS

    */

    function claim() public nonReentrant 
    {
        uint256[] memory tokenIds = getUserAmount(msg.sender);
        require(INFTPuzzle(nftPuzzleContractAddress).burn(tokenIds), "Not able to burn");
        emit TokenBurned(tokenIds);
        tokenID++;
        _mint(msg.sender ,tokenID);
        

    }


    function checkDifferents(uint256 _coleectionTotal, uint256 _userAmount, uint256[] memory userTokenIndexes) internal pure returns(bool)
    {
        uint[] memory checked;
        
        require(_userAmount == 10, "Not exactly 10 tokens.");
        
        for(uint i = 0; i<_userAmount; i++)
        {
            checked[i] = (userTokenIndexes[i] % _coleectionTotal + 1);
            
            for(uint _i = 0; _i<i; _i++)
            {
                
                if(checked[i] == checked[_i])
                {
                    return false;
                }
            }
        }

        return true;

    }

    /*

    FOR TESTS

    */

    function getUserAmount(address _address) public returns(uint256[] memory) 
    {
        (uint256[] memory _userTokenIds) = INFTPuzzle(nftPuzzleContractAddress).getUserTokenIds(_address);
        emit UserInfo(_userTokenIds);

        return _userTokenIds;
    } 


    /*

    METADATA

    */


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


