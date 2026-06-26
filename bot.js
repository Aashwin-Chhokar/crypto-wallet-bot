const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, ".env")
});

const { Client, GatewayIntentBits } = require("discord.js");

const connectDB = require("./config/db");
const User = require("./models/User");
const { createWallet } = require("./services/wallet");
const startWatcher = require("./services/watcher");
const { getBalance } = require("./services/balance");


// =====================
// CONNECT DATABASE
// =====================
connectDB();


// =====================
// DISCORD CLIENT
// =====================
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});


// =====================
// READY EVENT
// =====================
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  // start deposit watcher
  startWatcher(client);
});


// =====================
// COMMAND HANDLER
// =====================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;


  // =====================
  // /wallet COMMAND
  // =====================
  if (interaction.commandName === "wallet") {
    try {
      await interaction.deferReply({ ephemeral: true });

      let user = await User.findOne({
        discordId: interaction.user.id
      });

      if (!user) {
        const wallet = createWallet();

        user = await User.create({
          discordId: interaction.user.id,
          walletAddress: wallet.address,
          privateKey: wallet.privateKey
        });
      }

      return await interaction.editReply(
        `💳 Your Wallet Address:\n\`${user.walletAddress}\``
      );

    } catch (err) {
      console.log("WALLET ERROR:", err);

      if (interaction.deferred) {
        return interaction.editReply("❌ Wallet error occurred");
      } else {
        return interaction.reply({
          content: "❌ Wallet error occurred",
          ephemeral: true
        });
      }
    }
  }


  // =====================
  // /balance COMMAND
  // =====================
  if (interaction.commandName === "balance") {
    try {
      await interaction.deferReply({ ephemeral: true });

      const user = await User.findOne({
        discordId: interaction.user.id
      });

      if (!user) {
        return interaction.editReply("❌ Use /wallet first");
      }

      const bal = await getBalance(user.walletAddress);

      return await interaction.editReply(
        `💰 Balance:\n\`${bal} ETH\``
      );

    } catch (err) {
      console.log("BALANCE ERROR:", err);
      return interaction.editReply("❌ Balance error");
    }
  }


  // =====================
  // /deposit COMMAND
  // =====================
if (interaction.commandName === "deposit") {
  try {
    await interaction.deferReply({ ephemeral: true });

    const user = await User.findOne({
      discordId: interaction.user.id
    });

    if (!user || !user.walletAddress) {
      return interaction.editReply(
        "❌ You don’t have a wallet yet. Use /wallet first."
      );
    }

    return await interaction.editReply(
`📥 Deposit Address:

\`${user.walletAddress}\`

Network: Sepolia Testnet`
    );

  } catch (err) {
    console.log("DEPOSIT ERROR:", err);

    if (interaction.deferred) {
      return interaction.editReply("❌ Deposit error occurred");
    } else {
      return interaction.reply({
        content: "❌ Deposit error occurred",
        ephemeral: true
      });
    }
  }
}
});


// =====================
// LOGIN BOT
// =====================
client.login(process.env.DISCORD_TOKEN);