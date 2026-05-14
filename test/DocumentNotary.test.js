const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("DocumentNotary", function () {
  async function deployFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const DocumentNotary = await ethers.getContractFactory("DocumentNotary");
    const contract = await DocumentNotary.deploy();
    await contract.waitForDeployment();
    return { contract, owner, user1, user2 };
  }

  it("sets deployer as immutable owner", async function () {
    const { contract, owner } = await deployFixture();
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("notarizes a new document and stores all fields", async function () {
    const { contract, user1 } = await deployFixture();
    const docHash = ethers.keccak256(ethers.toUtf8Bytes("thesis-v1"));
    const description = "Thesis draft v1";

    await expect(contract.connect(user1).notarizeDocument(docHash, description))
      .to.emit(contract, "DocumentNotarized")
      .withArgs(docHash, user1.address, anyValue, description);

    const [docOwner, timestamp, storedDescription, exists] = await contract.getDocumentInfo(docHash);
    expect(docOwner).to.equal(user1.address);
    expect(timestamp).to.be.gt(0n);
    expect(storedDescription).to.equal(description);
    expect(exists).to.equal(true);
    expect(await contract.documentCount()).to.equal(1n);
  });

  it("prevents notarizing the same hash twice", async function () {
    const { contract, user1, user2 } = await deployFixture();
    const docHash = ethers.keccak256(ethers.toUtf8Bytes("same-file"));

    await contract.connect(user1).notarizeDocument(docHash, "first");
    await expect(contract.connect(user2).notarizeDocument(docHash, "second")).to.be.revertedWith(
      "Document already notarized"
    );
  });

  it("rejects the zero hash in notarize and verify", async function () {
    const { contract, user1 } = await deployFixture();
    const zeroHash = ethers.ZeroHash;

    await expect(contract.connect(user1).notarizeDocument(zeroHash, "invalid")).to.be.revertedWith(
      "Invalid document hash"
    );
    await expect(contract.connect(user1).verifyDocument(zeroHash)).to.be.revertedWith(
      "Invalid document hash"
    );
  });

  it("returns false and zero-values for non-existent documents", async function () {
    const { contract, user1 } = await deployFixture();
    const unknownHash = ethers.keccak256(ethers.toUtf8Bytes("unknown"));

    await expect(contract.connect(user1).verifyDocument(unknownHash))
      .to.emit(contract, "DocumentVerified")
      .withArgs(unknownHash, false, user1.address);

    const [docOwner, timestamp, description, exists] = await contract.getDocumentInfo(unknownHash);
    expect(exists).to.equal(false);
    expect(docOwner).to.equal(ethers.ZeroAddress);
    expect(timestamp).to.equal(0n);
    expect(description).to.equal("");
  });

  it("tracks documents per owner", async function () {
    const { contract, user1 } = await deployFixture();
    const hash1 = ethers.keccak256(ethers.toUtf8Bytes("doc-1"));
    const hash2 = ethers.keccak256(ethers.toUtf8Bytes("doc-2"));

    await contract.connect(user1).notarizeDocument(hash1, "one");
    await contract.connect(user1).notarizeDocument(hash2, "two");

    const ownedDocs = await contract.getDocumentsByOwner(user1.address);
    expect(ownedDocs).to.deep.equal([hash1, hash2]);
    expect(await contract.documentCount()).to.equal(2n);
  });
});
