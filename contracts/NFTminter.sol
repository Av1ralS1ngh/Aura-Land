// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NFT is ERC721, Ownable {
    using Strings for uint256;

    // Maximum number of NFTs available (set to 1200 for random assignment).
    uint256 public constant MAX_TOKENS = 1200;

    uint256 public totalSupply;
    mapping(address => uint256) private mintedPerWallet;

    string public baseUri;
    string public baseExtension = ".json";

    // Mapping from minted token ID to its randomly assigned metadata ID.
    mapping(uint256 => uint256) private _tokenMetadata;
    // Mapping for tracking available metadata IDs using a reservoir sampling technique.
    mapping(uint256 => uint256) private _availableTokens;
    // Count of remaining available metadata IDs.
    uint256 private _numAvailable = MAX_TOKENS;

    // Hardcoded token name "AuraEyes" and symbol "EoA"
    constructor() ERC721("AuraEyes", "EoA") Ownable(msg.sender) {
        baseUri = "https://gateway.lighthouse.storage/ipfs/bafybeiem7ucsjote74moefa2kmprng6cdtcey43hakgvpww3icahqtpgee/";
    }

    /**
     * @notice Mints a specified number of NFTs.
     * Each NFT is assigned a unique random metadata ID between 1 and MAX_TOKENS.
     */
    function mint(uint256 _numTokens) external payable {
        uint256 curTotalSupply = totalSupply;
        require(curTotalSupply + _numTokens <= MAX_TOKENS, "Exceeds total supply.");

        for (uint256 i = 0; i < _numTokens; i++) {
            // New token ID (sequentially assigned)
            uint256 newTokenId = curTotalSupply + i + 1;

            // Generate a pseudo-random index based on block data and loop variables.
            uint256 randNonce = uint256(
                keccak256(abi.encodePacked(block.timestamp, msg.sender, newTokenId, i))
            );
            uint256 randomIndex = randNonce % _numAvailable;

            // Determine the metadata ID at the random index:
            // If _availableTokens[randomIndex] is 0, then it has not been assigned yet so use randomIndex + 1.
            uint256 metadataId = _availableTokens[randomIndex];
            if (metadataId == 0) {
                metadataId = randomIndex + 1;
            }

            // Swap-and-pop: replace the selected index with the value at the last available index.
            uint256 lastIndex = _numAvailable - 1;
            uint256 lastVal = _availableTokens[lastIndex];
            if (lastVal == 0) {
                _availableTokens[randomIndex] = lastIndex + 1;
            } else {
                _availableTokens[randomIndex] = lastVal;
            }
            _numAvailable--;

            // Record the random metadata ID for the new token.
            _tokenMetadata[newTokenId] = metadataId;

            // Mint the token to the sender.
            _safeMint(msg.sender, newTokenId);
        }
        mintedPerWallet[msg.sender] += _numTokens;
        totalSupply += _numTokens;
    }

    function withdrawAll() external payable onlyOwner {
        uint256 balance = address(this).balance;
        (bool transfer, ) = payable(msg.sender).call{value: balance}("");
        require(transfer, "Transfer failed.");
    }

    /**
     * @notice Returns the token URI for a given token.
     * Uses the randomly assigned metadata ID.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");
        return string(abi.encodePacked(_baseURI(), _tokenMetadata[tokenId].toString(), baseExtension));
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseUri;
    }
}
