const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  ImageRun,
  AlignmentType,
  PageBreak,
  Header,
  Footer,
  TableOfContents,
} = require("docx");

const root = path.resolve(__dirname, "..");
const outPath = path.join(root, "F4_DocumentNotary_Report.docx");

function p(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 23 })],
    spacing: { after: 140, line: 320 },
  });
}

function bullet(text) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 100, line: 300 },
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 220, after: 120 },
    children: [new TextRun({ text, bold: true, size: 32 })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 100 },
    children: [new TextRun({ text, bold: true, size: 27 })],
  });
}

function getImageDimensions(buffer) {
  // PNG signature
  if (buffer.toString("hex", 0, 8) === "89504e470d0a1a0a") {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  // JPEG signature (FFD8)
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);

      // SOF0 / SOF2 markers contain dimensions
      if (marker === 0xc0 || marker === 0xc2) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }

      offset += 2 + length;
    }
  }

  throw new Error("Unsupported image format. Use PNG or JPEG screenshots.");
}

function addImage(relativePath, caption, maxWidth = 620, maxHeight = 380) {
  const imagePath = path.join(root, relativePath);
  const imageBuffer = fs.readFileSync(imagePath);
  const { width, height } = getImageDimensions(imageBuffer);
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  const renderWidth = Math.round(width * ratio);
  const renderHeight = Math.round(height * ratio);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new ImageRun({
          data: imageBuffer,
          transformation: { width: renderWidth, height: renderHeight },
        }),
      ],
      spacing: { after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: caption, italics: true, size: 20 })],
      spacing: { after: 240 },
    }),
  ];
}

const sections = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1400, after: 220 },
    children: [new TextRun({ text: "FINAL PROJECT REPORT", bold: true, size: 34 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: "Smart Contract Applications", size: 24 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 520 },
    children: [new TextRun({ text: "Project F4 - Document Timestamping Notary", bold: true, size: 30 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: "Student: Ahmed", size: 24 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: "Date: 14 May 2026", size: 24 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 280 },
    children: [new TextRun({ text: "Blockchain & Smart Contracts Course", size: 24 })],
  }),
  new Paragraph({ children: [new PageBreak()] }),

  h1("Executive Summary"),
  p(
    "This report presents the design, implementation, and validation of a decentralized document timestamping system using Ethereum smart contracts. The solution records only document hashes on-chain to provide immutable proof-of-existence while preserving document privacy."
  ),
  p(
    "The project includes a Solidity contract, automated Hardhat tests, a browser-based frontend connected through MetaMask, and live demonstration evidence from deployment and transaction execution."
  ),

  h1("1. Problem Statement and Motivation"),
  p(
    "Traditional timestamping relies on centralized notary services or institutional databases. These systems can introduce trust, availability, and cost constraints. In academic, legal, and commercial scenarios, users need a verifiable and tamper-resistant proof that a digital artifact existed at a specific time."
  ),
  p(
    "Project F4 addresses this by leveraging blockchain immutability. Instead of uploading files, the system computes a SHA-256 digest locally and notarizes the digest on-chain. Any party can later recompute the hash and verify ownership and timestamp."
  ),

  h1("2. Technical Architecture"),
  h2("2.1 Smart Contract Layer"),
  bullet("Language: Solidity ^0.8.19"),
  bullet("Core contract: DocumentNotary"),
  bullet("Storage model: mapping(bytes32 => Document)"),
  bullet("Security controls: valid hash guard and duplicate prevention"),
  bullet("Auditability: event emission on notarization and verification"),

  h2("2.2 Frontend Layer"),
  bullet("Stack: HTML/CSS/JavaScript + ethers.js v6"),
  bullet("Wallet integration: MetaMask via window.ethereum"),
  bullet("Local hashing: Web Crypto API (SHA-256)"),
  bullet("Network target: Hardhat local node (Chain ID 31337)"),

  h1("3. Smart Contract Design Walkthrough"),
  h2("3.1 Data Model"),
  p(
    "The Document struct stores owner address, block timestamp, free-text description, and an exists flag. The exists flag is mandatory because uninitialized mappings return zero values."
  ),
  h2("3.2 Main Functions"),
  bullet("notarizeDocument(bytes32, string): writes new proof and emits DocumentNotarized."),
  bullet("verifyDocument(bytes32): emits DocumentVerified and returns proof details."),
  bullet("getDocumentInfo(bytes32): read-only accessor used by frontend."),
  bullet("getDocumentsByOwner(address): returns all hashes registered by an address."),
  h2("3.3 Security and Correctness"),
  bullet("Rejects empty hash values (bytes32(0))."),
  bullet("Rejects duplicate notarization attempts for the same hash."),
  bullet("Stores only hash metadata to avoid leaking document content."),

  h1("4. Implementation and Execution Procedure"),
  p("The complete run sequence used in this project is listed below:"),
  bullet('cd "/home/ahmed/Blockchain Final Project"'),
  bullet("npm install"),
  bullet("npm run compile"),
  bullet("npm test"),
  bullet("npm run node"),
  bullet("npm run deploy:local"),
  bullet('cd frontend && python3 -m http.server 5500'),
  p("The frontend was accessed at http://127.0.0.1:5500 and connected through MetaMask."),

  h1("5. Test Strategy and Validation Results"),
  p(
    "Automated tests were executed using Hardhat. The suite validates ownership assignment, successful notarization, duplicate blocking, zero-hash rejection, unknown hash verification behavior, and owner-specific document retrieval."
  ),
  bullet("Result: 6 passing tests."),
  bullet("Compilation status: successful."),
  bullet("Local deployment status: successful."),

  new Paragraph({ children: [new PageBreak()] }),
  h1("6. Evidence Screenshots"),
  p("All screenshots below are captured from the actual implementation session."),
  ...addImage(
    "report-assets/network-setup.png",
    "Figure 1. MetaMask custom network configuration for Hardhat Local."
  ),
  ...addImage(
    "report-assets/metamask-confirm.png",
    "Figure 2. Transaction confirmation dialog on Hardhat Local network."
  ),
  ...addImage(
    "report-assets/notarize-success.png",
    "Figure 3. Notarization success message with block and transaction hash."
  ),
  ...addImage(
    "report-assets/verify-initial.png",
    "Figure 4. Verification interface during live test execution."
  ),
  ...addImage(
    "report-assets/verify-fixed.png",
    "Figure 5. Final verification screen after frontend mapping fix."
  ),
  ...addImage(
    "report-assets/tests-passing.png",
    "Figure 6. Terminal evidence of successful Hardhat test suite."
  ),
  ...addImage(
    "report-assets/deploy-output.png",
    "Figure 7. Terminal evidence of successful local contract deployment."
  ),

  h1("7. Challenges and Improvements"),
  bullet("Resolved environment issues related to Node and Hardhat compatibility."),
  bullet("Handled intermittent package-network failures during setup."),
  bullet("Corrected frontend tuple mapping bug to display verification fields properly."),
  bullet("Added cache-busting on frontend script to avoid stale browser assets."),
  bullet("Funded local MetaMask account for smooth local transaction execution."),

  h1("8. Conclusion"),
  p(
    "The project goals for F4 were achieved successfully. The implemented dApp provides a reliable and privacy-preserving proof-of-existence workflow with complete smart contract functionality, automated test validation, and user-facing interaction through MetaMask."
  ),
  p(
    "This implementation can be extended to production-style environments by integrating testnet deployment, richer access control policies, and formal static-analysis reports."
  ),
];

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1200, right: 1000, bottom: 1200, left: 1000 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "F4 - Document Timestamping Notary", size: 18 })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "F4 Report - Document Timestamping Notary", size: 18 })],
            }),
          ],
        }),
      },
      children: [
        ...sections.slice(0, 8),
        new Paragraph({
          children: [new PageBreak()],
        }),
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: "Table of Contents", bold: true, size: 32 })],
        }),
        new TableOfContents("Contents", {
          hyperlink: true,
          headingStyleRange: "1-2",
        }),
        new Paragraph({ children: [new PageBreak()] }),
        ...sections.slice(8),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log(`Report generated: ${outPath}`);
});
