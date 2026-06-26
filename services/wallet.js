const { ethers } = require("ethers");

function createWallet() {
  const wallet = ethers.Wallet.createRandom();

  return {
    address: wallet.address,
    privateKey: wallet.privateKey
  };
}

module.exports = { createWallet };