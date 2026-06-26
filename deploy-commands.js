const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const commands = [

  // =====================
  // WALLET
  // =====================
  new SlashCommandBuilder()
    .setName("wallet")
    .setDescription("Create or view your crypto wallet")
    .toJSON(),

  // =====================
  // BALANCE
  // =====================
  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your wallet balance")
    .toJSON(),

  // =====================
  // DEPOSIT
  // =====================
  new SlashCommandBuilder()
    .setName("deposit")
    .setDescription("Get your deposit address")
    .toJSON(),

  // =====================
  // SEND (internal transfer)
  // =====================
  new SlashCommandBuilder()
    .setName("send")
    .setDescription("Send ETH to another user")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("User to send ETH")
        .setRequired(true)
    )
    .addNumberOption(option =>
      option
        .setName("amount")
        .setDescription("Amount of ETH to send")
        .setRequired(true)
    )
    .toJSON(),

  // =====================
  // WITHDRAW (real blockchain tx)
  // =====================
  new SlashCommandBuilder()
    .setName("withdraw")
    .setDescription("Withdraw ETH to external wallet")
    .addNumberOption(option =>
      option
        .setName("amount")
        .setDescription("Amount of ETH to withdraw")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("address")
        .setDescription("Destination wallet address")
        .setRequired(true)
    )
    .toJSON()

];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("Slash commands registered successfully!");
  } catch (error) {
    console.error(error);
  }
})();