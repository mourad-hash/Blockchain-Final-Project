// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title DocumentNotary - Proof of Existence Smart Contract
/// @notice Allows users to notarize document hashes on-chain
/// @dev Stores only document hashes, never raw document data
contract DocumentNotary {
    struct Document {
        address owner;
        uint256 timestamp;
        string description;
        bool exists;
    }

    mapping(bytes32 => Document) private documents;
    mapping(address => bytes32[]) private ownerDocuments;

    uint256 public documentCount;
    address public immutable owner;

    event DocumentNotarized(
        bytes32 indexed docHash,
        address indexed submitter,
        uint256 timestamp,
        string description
    );

    event DocumentVerified(
        bytes32 indexed docHash,
        bool exists,
        address indexed queriedBy
    );

    modifier notAlreadyNotarized(bytes32 docHash) {
        require(!documents[docHash].exists, "Document already notarized");
        _;
    }

    modifier validHash(bytes32 docHash) {
        require(docHash != bytes32(0), "Invalid document hash");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function notarizeDocument(
        bytes32 docHash,
        string calldata description
    ) external validHash(docHash) notAlreadyNotarized(docHash) {
        documents[docHash] = Document({
            owner: msg.sender,
            timestamp: block.timestamp,
            description: description,
            exists: true
        });

        ownerDocuments[msg.sender].push(docHash);
        documentCount += 1;

        emit DocumentNotarized(docHash, msg.sender, block.timestamp, description);
    }

    function verifyDocument(
        bytes32 docHash
    )
        external
        validHash(docHash)
        returns (bool exists, address docOwner, uint256 timestamp, string memory description)
    {
        Document storage document = documents[docHash];
        emit DocumentVerified(docHash, document.exists, msg.sender);
        return (document.exists, document.owner, document.timestamp, document.description);
    }

    function getDocumentInfo(
        bytes32 docHash
    )
        external
        view
        validHash(docHash)
        returns (address docOwner, uint256 timestamp, string memory description, bool exists)
    {
        Document storage document = documents[docHash];
        return (document.owner, document.timestamp, document.description, document.exists);
    }

    function getDocumentsByOwner(
        address account
    ) external view returns (bytes32[] memory) {
        return ownerDocuments[account];
    }
}
