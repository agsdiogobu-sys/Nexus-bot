const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");

// ❌ REMOVIDO DOTENV
// require("dotenv").config();

const token = process.env.TOKEN;

if (!token) {
  console.error("❌ TOKEN não encontrado nas Environment Variables!");
  process.exit(1);
}

const clientId = "1473771922968809554";
const guildId = "1466225552435445853";

// ===== BANCO JSON =====
const dbFile = "./database.json";

function loadDB() {
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, "{}");
  }
  return JSON.parse(fs.readFileSync(dbFile));
}

function saveDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

// 🔹 Canais
const canalRegistroId = "1466359216296955986";
const canalResultadoId = "1466926801627381966";

// 🔹 Cargos Tier
const tierC = "1466550983436931113";
const tierB = "1466550831091552627";
const tierA = "1466550749311013148";
const tierS = "1466550680717103217";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ===== COMANDOS =====
const commands = [
  new SlashCommandBuilder()
    .setName("registro")
    .setDescription("Fazer registro de jogador")
    .addStringOption(o =>
      o.setName("usuario_roblox").setDescription("Nick do Roblox").setRequired(true))
    .addIntegerOption(o =>
      o.setName("level").setDescription("Level").setRequired(true))
    .addStringOption(o =>
      o.setName("estilo").setDescription("Estilo de jogo").setRequired(true))
    .addStringOption(o =>
      o.setName("rank").setDescription("Rank").setRequired(true))
    .addStringOption(o =>
      o.setName("posicoes").setDescription("Posições").setRequired(true)),

  new SlashCommandBuilder()
    .setName("resultado")
    .setDescription("Resultado da avaliação")
    .addUserOption(o =>
      o.setName("jogador").setDescription("Jogador avaliado").setRequired(true))
    .addStringOption(o =>
      o.setName("usuario_roblox").setDescription("Nick Roblox").setRequired(true))
    .addNumberOption(o => o.setName("corte").setDescription("Nota Corte").setRequired(true))
    .addNumberOption(o => o.setName("block").setDescription("Nota Block").setRequired(true))
    .addNumberOption(o => o.setName("levantamento").setDescription("Nota Levantamento").setRequired(true))
    .addNumberOption(o => o.setName("recepcao").setDescription("Nota Recepção").setRequired(true))
    .addNumberOption(o => o.setName("saque").setDescription("Nota Saque").setRequired(true)),

  new SlashCommandBuilder()
    .setName("desafio")
    .setDescription("Desafiar um jogador para um X1")
    .addUserOption(o =>
      o.setName("jogador1").setDescription("Primeiro jogador").setRequired(true))
    .addUserOption(o =>
      o.setName("jogador2").setDescription("Segundo jogador").setRequired(true))
].map(cmd => cmd.toJSON());

// ===== REGISTRAR COMANDOS =====
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log("✅ Comandos atualizados!");
  } catch (err) {
    console.error("❌ Erro ao registrar comandos:", err);
  }
})();

// ===== BOT ONLINE =====
client.once("ready", () => {
  console.log(`🚀 Bot online como ${client.user.tag}`);
});

// ===== EVENTOS =====
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {

    // (SEU CÓDIGO DE INTERACTIONS FICA AQUI — NÃO MUDEI NADA DA SUA LÓGICA)

  } catch (error) {
    console.error("❌ Erro na interação:", error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "❌ Ocorreu um erro!", ephemeral: true });
    } else {
      await interaction.reply({ content: "❌ Ocorreu um erro!", ephemeral: true });
    }
  }
});

client.login(token);
