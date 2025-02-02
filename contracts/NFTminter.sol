// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    mapping(uint256 => string) private _tokenURIs;

    // Hardcode the token name as "AuraEyes" and symbol as "EoA"
    constructor() ERC721("AuraEyes", "EoA") Ownable(msg.sender) {}

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    // Override transfer functions to prevent transfers (soulbound behavior)
    function transferFrom(
        address,
        address,
        uint256
    ) public pure override {
        revert("MyToken: Tokens are soulbound and non-transferable");
    }

    function safeTransferFrom(
        address,
        address,
        uint256,
        bytes memory
    ) public pure override {
        revert("MyToken: Tokens are soulbound and non-transferable");
    }

    // Mint functions (onlyOwner) for each NFT with its specific metadata

    function mintNFT1(address to) external onlyOwner {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _tokenURIs[tokenId] = "https://gateway.lighthouse.storage/ipfs/bafybeibokqpidn3gvdnvp7zwgi7aqebxfg6qwyr4ze4m6jqjraaeq6rcoe/1.json";
        _mint(to, tokenId);
    }

    function mintNFT2(address to) external onlyOwner {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _tokenURIs[tokenId] = "https://gateway.lighthouse.storage/ipfs/bafybeibokqpidn3gvdnvp7zwgi7aqebxfg6qwyr4ze4m6jqjraaeq6rcoe/2.json";
        _mint(to, tokenId);
    }

    function mintNFT3(address to) external onlyOwner {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _tokenURIs[tokenId] = "https://gateway.lighthouse.storage/ipfs/bafybeibokqpidn3gvdnvp7zwgi7aqebxfg6qwyr4ze4m6jqjraaeq6rcoe/3.json";
        _mint(to, tokenId);
    }

    function mintNFT4(address to) external onlyOwner {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _tokenURIs[tokenId] = "https://gateway.lighthouse.storage/ipfs/bafybeibokqpidn3gvdnvp7zwgi7aqebxfg6qwyr4ze4m6jqjraaeq6rcoe/4.json";
        _mint(to, tokenId);
    }

    function mintNFT5(address to) external onlyOwner {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _tokenURIs[tokenId] = "https://gateway.lighthouse.storage/ipfs/bafybeibokqpidn3gvdnvp7zwgi7aqebxfg6qwyr4ze4m6jqjraaeq6rcoe/5.json";
        _mint(to, tokenId);
    }
}
