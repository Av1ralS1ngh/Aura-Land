export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
export const CONTRACT_ABI = [
  // Mint Function
  {
    "inputs": [],
    "name": "mintNFTs",
    "outputs": [{"internalType": "uint256", "name": "requestId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Event for NFTs Minted
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "user", "type": "address"},
      {"indexed": false, "name": "tokenIds", "type": "uint256[]"}
    ],
    "name": "NFTsMinted",
    "type": "event"
  }
];
