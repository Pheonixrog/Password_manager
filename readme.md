

# Password Manager DApp

The **Password Manager DApp** is a decentralized application that allows users to securely store and manage passwords on the Aptos blockchain. The DApp provides encryption and decentralized storage through **Move** smart contracts and a user-friendly interface built with **TypeScript**.

## Features
- **Secure Storage**: Users can store passwords securely on the blockchain.
- **Password Encryption**: All passwords are encrypted before being stored on-chain.
- **Move Smart Contracts**: Ensure decentralized and secure storage of sensitive information.
- **Easy Retrieval**: Users can retrieve their passwords with their private key.
- **User-Friendly Interface**: A simple UI for adding, viewing, and managing passwords.

## Technologies Used
- **Move Language**: Handles encrypted password storage and retrieval securely on the blockchain.
- **Aptos Blockchain**: Provides decentralized and secure password storage.
- **TypeScript**: For building the front-end where users can interact with the password manager.

## How It Works
1. **Add Password**: Users enter a service name (e.g., "Email") and the corresponding password.
2. **Store on Blockchain**: The password is encrypted and stored on the Aptos blockchain.
3. **Retrieve Password**: Users can retrieve passwords by entering the service name and their private key.
4. **On-Chain Security**: The Move smart contract ensures that only the rightful owner can access their passwords.

## Prerequisites
- **Aptos CLI**: For deploying and interacting with the smart contracts.
- **Move SDK**: For writing and deploying the smart contracts.
- **Node.js & npm**: For running the TypeScript front-end.


