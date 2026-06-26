const { ethers } = require("ethers");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// confirmations needed (testnet = 2, mainnet = 12)
const CONFIRMATIONS = 2;

function startWatcher(client) {
  console.log("👀 Deposit watcher started (PRO MODE)");

  provider.on("block", async (blockNumber) => {
    try {

      const block = await provider.getBlock(blockNumber, true);
      if (!block || !block.transactions) return;

      for (const tx of block.transactions) {

        // ignore contract calls / empty tx
        if (!tx.to || tx.value === 0n) continue;

        // prevent duplicate processing
        const exists = await Transaction.findOne({ txHash: tx.hash });
        if (exists) continue;

        // check if wallet belongs to user
        const user = await User.findOne({
          walletAddress: tx.to
        });

        if (!user) continue;

        const amount = Number(ethers.formatEther(tx.value));

        // save tx immediately (important for safety)
        const newTx = await Transaction.create({
          txHash: tx.hash,
          to: tx.to,
          amount,
          blockNumber,
          discordId: user.discordId,
          confirmed: false
        });

        console.log(`📥 Deposit detected: ${amount} ETH`);

        // wait for confirmations safely
        setTimeout(async () => {
          try {

            const receipt = await provider.getTransactionReceipt(tx.hash);
            if (!receipt) return;

            if (receipt.confirmations >= CONFIRMATIONS) {

              newTx.confirmed = true;
              await newTx.save();

              console.log(`✅ Confirmed deposit: ${tx.hash}`);

              // =========================
              // 📩 DISCORD DM NOTIFICATION
              // =========================
              if (client && user.discordId) {
                try {
                  const discordUser = await client.users.fetch(user.discordId);

                  await discordUser.send({
                    embeds: [
                      {
                        title: "📥 Deposit Confirmed",
                        color: 0x00ff00,
                        fields: [
                          {
                            name: "Amount",
                            value: `${amount} ETH`,
                            inline: true
                          },
                          {
                            name: "Wallet",
                            value: tx.to
                          },
                          {
                            name: "TX Hash",
                            value: tx.hash
                          }
                        ],
                        timestamp: new Date()
                      }
                    ]
                  });

                  console.log("📩 DM sent to user");

                } catch (err) {
                  console.log("❌ DM failed (user has DMs off)");
                }
              }

            }

          } catch (err) {
            console.log("Confirmation error:", err.message);
          }
        }, 15000);

      }

    } catch (err) {
      console.log("Watcher error:", err.message);
    }
  });
}

module.exports = startWatcher;