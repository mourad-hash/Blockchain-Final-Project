# Project F4 - Document Timestamping Notary

This project implements **F4 (Document Timestamping Notary)** from the assignment list.
It lets users anchor a document fingerprint (`SHA-256` hash) on-chain to prove that
the document existed at a specific time, without publishing the document itself.

## Project files

- Smart contract: `contracts/DocumentNotary.sol`
- Tests: `test/DocumentNotary.test.js`
- Frontend demo: `frontend/index.html`
- Deploy script: `scripts/deploy.js`

## How it works

Users submit a document hash (`bytes32`) instead of raw file content.  
For each hash, the contract stores:

- owner address (`msg.sender`)
- block timestamp (`block.timestamp`)
- optional description
- existence flag

This creates immutable timestamped proof while keeping document content private.

## Prerequisites

- Node.js 18+ (or compatible LTS)
- npm
- MetaMask (for frontend interaction)

## Quick start

```bash
npm install
npx hardhat compile
npx hardhat test
```

## Run locally (Hardhat network)

### 1) Start local blockchain

```bash
npx hardhat node
```

### 2) Deploy contract (new terminal)

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address from terminal output.

## Frontend demo usage

1. Open `frontend/index.html` in a browser.
2. Connect MetaMask to `Localhost 8545`.
3. Import one of the Hardhat test accounts into MetaMask (using its private key).
4. Paste deployed contract address into the app.
5. Select a file to compute its SHA-256 hash in-browser.
6. Optionally add a description and click **Notarize**.
7. Verify by selecting the same file again (or by pasting the hash).

## Contract behavior notes

- File contents never leave the browser; only hash is sent on-chain.
- Duplicate hashes are rejected.
- Zero hash (`bytes32(0)`) is rejected.
- Each hash can be notarized only once.

## Testing

Run all tests:

```bash
npx hardhat test
```

## Troubleshooting

- **MetaMask cannot connect**: verify RPC is `http://127.0.0.1:8545` and chain is local.
- **Transaction fails**: ensure you are using a funded Hardhat account.
- **Verification mismatch**: make sure you use the exact same original file bytes.
