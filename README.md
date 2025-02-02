# **Cross-Chain NFT Gaming Platform**

## 🚀 Overview

This is a **Cross-Chain NFT Game** where players can:
- **Select characters** and **mint NFTs**  
- **Interact with NPCs** for **trading and battles**  
- **Engage in multiplayer interactions** (trade, chat, battle)  
- **Use an in-game economy** powered by **ERC-20 tokens**  
- **Access a marketplace** for NFT trading  
- **Earn Soulbound Tokens (SBTs)** as achievements  

## 🎮 **Gameplay Features**

### **Game Flow**  
1️⃣ **User Launches Game** → Connects wallet via **Privy authentication**  
2️⃣ **Character Selection & NFT Minting** → Players select a character, input a location, and mint **5 pseudo-random NFTs**  
3️⃣ **NPC Interaction**  
   - **Trade NFTs**: NPC offers an NFT for a price in **ERC-20 tokens**  
   - **Battle NPC**: Users can challenge NPCs to **negotiate discounts**  
     - Winner is determined based on NFT **rarity & skill level**  
4️⃣ **Multiplayer Mode**  
   - Players can **trade, chat, and battle** other players **in real-time**  

---

### 🛒 **In-Game Economy & Marketplace**
- **NFT Inventory** → View & manage owned NFTs  
- **Marketplace** → Buy/sell NFTs using **ERC-20 tokens**  
- **Wallet** → Displays **ERC-20 token balance**  
- **Achievements & Soulbound Tokens** → Earn **Soulbound Tokens (SBTs)** for completing milestones  

---

### 🔀 **Cross-Chain NFT Transfers**
- **Mint on One Chain, Burn on Another** → NFTs are transferred **by burning on the source chain & minting on the destination chain**  

---

## 📌 **User Flowchart**  
![Game Flowchart](https://drive.google.com/file/d/1jvLgq9u0Pqw4CxZEQWVZGSGPndXBSH1-/view?usp=sharing)  

---

## 🛠️ **Tech Stack**
### **Frontend**  
- **Next.js, Phaser.js** → Game Interface  
- **TailwindCSS, Shadcn** → UI Styling  
- **Three.js** → 3D Interactions  
- **Privy** → Authentication  

### **Backend & Smart Contracts**  
- **Solidity, Foundry** → Smart Contracts (ERC-721 NFTs, ERC-20, and SBTs)  
- **IPFS, Pinata** → Decentralized Storage  
- **Socket.io** → WebSocket-based Multiplayer Communication  

---

## ⚙️ **Setup Instructions**
### **📦 Installation**  
```sh
# Clone the repository
git clone https://github.com/Av1ralS1ngh/Aura-Land.git
cd Aura-Land/game-client

# Install dependencies
npm install
```

### **🏗️ Running the Project**  
```sh
# Start the frontend
npm run dev
```

---

## 🔮 **Future Improvements**
- 🔹 **Enhance Cross-Chain Logic** → Implement **trustless transfers** using **LayerZero**  
- 🤖 **Integrate AI Agents** → AI can **play and earn NFTs** for the user  
- 🔑 **Account Abstraction** → AI Agents will have **dedicated accounts** to **earn NFTs** and transfer them to players  
- 🎲 **True Randomness** → Use **Chainlink VRF** for **truly random NFT minting**  
