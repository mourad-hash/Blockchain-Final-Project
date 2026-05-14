# F4 Demo Video Commands (Discussion Recording)

Use this file as your exact runbook while recording the demo.

## 0) Open 3 terminals

- **Terminal A**: local blockchain node
- **Terminal B**: deploy + test commands
- **Terminal C**: frontend server

---

## 1) Project setup (say this once in video)

```bash
cd "/home/ahmed/Blockchain Final Project"
npm install
npm run compile
npm test
```

What to say:
- "This is project F4: Document Timestamping Notary."
- "The contract compiles and tests pass before demoing the UI."

---

## 2) Start local blockchain

Run in **Terminal A**:

```bash
cd "/home/ahmed/Blockchain Final Project"
npm run node
```

What to say:
- "I am running a local Hardhat blockchain on 127.0.0.1:8545, chain ID 31337."

---

## 3) Deploy the smart contract

Run in **Terminal B**:

```bash
cd "/home/ahmed/Blockchain Final Project"
npm run deploy:local
```

Copy the deployed address shown in terminal, for example:
- `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`

What to say:
- "This command deploys DocumentNotary to the local chain."
- "I will use this deployed contract address in the frontend."

---

## 4) Start frontend

Run in **Terminal C**:

```bash
cd "/home/ahmed/Blockchain Final Project/frontend"
python3 -m http.server 5500
```

Open in browser:
- `http://127.0.0.1:5500`

What to say:
- "The frontend is served locally and interacts with the deployed contract."

---

## 5) MetaMask network settings (show quickly)

Set/select network:
- Name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Symbol: `ETH`

If needed, import funded local account private key:
- `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

What to say:
- "This is local test ETH only, not real funds."

---

## 6) UI demo flow (main recording part)

1. Click **Connect MetaMask**
2. Paste contract address in **Contract Address**
3. Select a file
4. Click **Compute SHA-256 Hash**
5. Add optional description
6. Click **Notarize** and confirm transaction
7. In verify section, upload same file (or paste hash)
8. Click **Verify**

What to say:
- "The document file never leaves the browser."
- "Only SHA-256 hash is stored on-chain."
- "The result returns owner, timestamp, and description."

---

## 7) Optional: quick RPC proof in terminal

```bash
curl -s -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

Expected:
- `"result":"0x7a69"` (31337)

---

## 8) End-of-video checklist

Before stopping recording, make sure you showed:
- Passing tests (`npm test`)
- Deployment command output
- Wallet connected
- Successful notarize transaction
- Successful verify result

---

## 9) One-command recap (optional)

```bash
cd "/home/ahmed/Blockchain Final Project" && npm run compile && npm test
```

