import { ethers } from "ethers";

// Replace with your deployed contract address
export const CONTRACT_ADDRESS = "0xd52bcCFDA3AA54CDeeeF13C3875448313656E858";

// Replace with your ABI (from Remix or compilation)
export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_patient", "type": "address" },
      { "internalType": "address", "name": "_doctor", "type": "address" },
      { "internalType": "address", "name": "_hospital", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "doctor",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "hospital",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "patient",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "ipfsMetadata", "type": "string" }
    ],
    "name": "requestSignature",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "hashID", "type": "bytes32" }
    ],
    "name": "signRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "ipfsMetadata", "type": "string" },
      { "internalType": "bytes32", "name": "hashID", "type": "bytes32" }
    ],
    "name": "mintBundle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "uri",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
  // Add more functions if needed, but keep it flat (no outer array)
];
