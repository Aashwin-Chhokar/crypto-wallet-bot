const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

async function getBalance(address) {
  const bal = await provider.getBalance(address);
  return ethers.formatEther(bal);
}

module.exports = { getBalance };