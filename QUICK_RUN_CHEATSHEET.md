# F4 Quick Run Cheat Sheet

Use this when you need to run the whole project fast.

## 0) Project path

```bash
cd "/home/ahmed/Blockchain Final Project"
```

---

## 1) One-time install

```bash
npm install
```

---

## 2) Daily run (3 terminals)

## Terminal A - start local blockchain

```bash
cd "/home/ahmed/Blockchain Final Project"
npm run node
```

Keep this terminal open.

## Terminal B - deploy contract

```bash
cd "/home/ahmed/Blockchain Final Project"
npm run deploy:local
```

Copy contract address from output (example):

`0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`

## Terminal C - run frontend server

```bash
cd "/home/ahmed/Blockchain Final Project/frontend"
python3 -m http.server 5500
```

Open in browser:

`http://127.0.0.1:5500`

---

## 3) MetaMask quick setup

- Network Name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency Symbol: `ETH`

If your account has 0 ETH, import funded Hardhat account:

`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

---

## 4) Use app flow

1. Click **Connect Wallet**
2. Paste deployed contract address
3. Select file
4. Click **Notarize**
5. Confirm MetaMask transaction
6. Go to **Verify** tab
7. Upload same file and click **Verify**
8. Open **My Documents** tab to view your hashes

---

## 5) Verify code health quickly

```bash
cd "/home/ahmed/Blockchain Final Project"
npm run compile
npm test
```

Expected:
- compile successful
- all tests passing

---

## 6) Common issues fast fixes

## A) "Sender doesn't have enough funds"

Fund your current MetaMask address:

```bash
cd "/home/ahmed/Blockchain Final Project"
node - <<'NODE'
const { ethers } = require('ethers');
(async () => {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const funder = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);
  const to = 'PASTE_YOUR_METAMASK_ADDRESS_HERE';
  const tx = await funder.sendTransaction({ to, value: ethers.parseEther('25') });
  await tx.wait();
  console.log('Funded:', to);
})();
NODE
```

## B) MetaMask not found

- Open app via `http://127.0.0.1:5500` (not `file://`)
- Ensure MetaMask extension is enabled

## C) Wrong network fee / real ETH concern

- Make sure MetaMask network is **Hardhat Local**, not Ethereum main network.

## D) Contract call fails

- Redeploy and paste new address:

```bash
cd "/home/ahmed/Blockchain Final Project"
npm run deploy:local
```

## E) UI looks stale

- Hard refresh: `Ctrl+Shift+R`

---

## 7) 60-second full reset

```bash
cd "/home/ahmed/Blockchain Final Project"
npm run compile
npm test
# open 3 terminals again: node / deploy / frontend
```

