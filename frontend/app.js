const ABI = [
  "function notarizeDocument(bytes32 docHash, string description) external",
  "function verifyDocument(bytes32 docHash) external returns (bool,address,uint256,string)",
  "function getDocumentInfo(bytes32 docHash) external view returns (address,uint256,string,bool)",
];

let provider;
let signer;

const connectBtn = document.getElementById("connectBtn");
const hashBtn = document.getElementById("hashBtn");
const notarizeBtn = document.getElementById("notarizeBtn");
const verifyBtn = document.getElementById("verifyBtn");

connectBtn.addEventListener("click", connectWallet);
hashBtn.addEventListener("click", computeHashForNotarize);
notarizeBtn.addEventListener("click", notarizeDocument);
verifyBtn.addEventListener("click", verifyDocument);

async function connectWallet() {
  const walletStatus = document.getElementById("walletStatus");
  if (!window.ethereum) {
    walletStatus.textContent = "MetaMask not found.";
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  walletStatus.textContent = `Connected: ${await signer.getAddress()}`;
}

async function sha256FromFile(file) {
  const data = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return `0x${hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

async function computeHashForNotarize() {
  const file = document.getElementById("notarizeFile").files[0];
  const hashOutput = document.getElementById("computedHash");

  if (!file) {
    hashOutput.textContent = "Choose a file first.";
    return;
  }

  const hash = await sha256FromFile(file);
  hashOutput.textContent = `Hash: ${hash}`;
  hashOutput.dataset.hash = hash;
}

function getContract() {
  const contractAddress = document.getElementById("contractAddress").value.trim();
  if (!signer) {
    throw new Error("Connect your wallet first.");
  }
  if (!ethers.isAddress(contractAddress)) {
    throw new Error("Enter a valid contract address.");
  }
  return new ethers.Contract(contractAddress, ABI, signer);
}

async function notarizeDocument() {
  const status = document.getElementById("notarizeStatus");
  const desc = document.getElementById("description").value.trim();
  const hash = document.getElementById("computedHash").dataset.hash;

  try {
    if (!hash) {
      throw new Error("Compute hash before notarizing.");
    }
    const contract = getContract();
    status.textContent = "Sending transaction...";
    const tx = await contract.notarizeDocument(hash, desc);
    const receipt = await tx.wait();
    status.textContent = `Notarized in block ${receipt.blockNumber}. Tx: ${receipt.hash}`;
  } catch (error) {
    status.textContent = `Error: ${error.shortMessage || error.message}`;
  }
}

async function verifyDocument() {
  const result = document.getElementById("verifyResult");
  const file = document.getElementById("verifyFile").files[0];
  const pastedHash = document.getElementById("verifyHashInput").value.trim();

  try {
    const contract = getContract();
    const hash = file ? await sha256FromFile(file) : pastedHash;

    if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
      throw new Error("Provide a valid bytes32 hash.");
    }

    const [owner, timestamp, description, exists] = await contract.getDocumentInfo(hash);
    if (!exists) {
      result.textContent = `Not notarized.\nHash: ${hash}`;
      return;
    }

    const date = new Date(Number(timestamp) * 1000);
    result.textContent = [
      `Hash: ${hash}`,
      `Exists: ${exists}`,
      `Owner: ${owner}`,
      `Timestamp: ${timestamp} (${date.toISOString()})`,
      `Description: ${description || "(none)"}`,
    ].join("\n");
  } catch (error) {
    result.textContent = `Error: ${error.shortMessage || error.message}`;
  }
}
