const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");
require("dotenv").config();

const token = process.env.TOKEN;
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

// ===== REGISTRAR =====
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(clientId, guildId),
    { body: commands }
  );
  console.log("✅ Comandos atualizados!");
})();

// ===== EVENTOS =====
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // ===== REGISTRO =====
  if (interaction.commandName === "registro") {

    const canal = await client.channels.fetch(canalRegistroId);

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("📋 FORMULÁRIO DE INDICAÇÃO – NEXUS")
      .addFields(
        { name: "👤 Usuário (Roblox)", value: interaction.options.getString("usuario_roblox") },
        { name: "🎮 Level", value: interaction.options.getInteger("level").toString(), inline: true },
        { name: "🏐 Estilo", value: interaction.options.getString("estilo") },
        { name: "📊 Rank", value: interaction.options.getString("rank"), inline: true },
        { name: "📍 Posições", value: interaction.options.getString("posicoes"), inline: true },
        { name: "🆔 Registrado por", value: `${interaction.user}` }
      )
      .setTimestamp();

    await canal.send({ embeds: [embed] });
    await interaction.reply({ content: "✅ Registro enviado!", ephemeral: true });
  }

  // ===== RESULTADO =====
  if (interaction.commandName === "resultado") {

    const db = loadDB();
    const canal = await client.channels.fetch(canalResultadoId);

    const jogador = interaction.options.getUser("jogador");
    const usuario = interaction.options.getString("usuario_roblox");

    const corte = interaction.options.getNumber("corte");
    const block = interaction.options.getNumber("block");
    const levantamento = interaction.options.getNumber("levantamento");
    const recepcao = interaction.options.getNumber("recepcao");
    const saque = interaction.options.getNumber("saque");

    const mediaNumero = (corte + block + levantamento + recepcao + saque) / 5;
    const media = mediaNumero.toFixed(1).replace(".", ",");

    let tierNome, cargoId, cor;

    if (mediaNumero < 5) {
      tierNome = "Tier C";
      cargoId = tierC;
      cor = "#808080";
    } else if (mediaNumero <= 7.5) {
      tierNome = "Tier B";
      cargoId = tierB;
      cor = "#3498DB";
    } else if (mediaNumero <= 8.5) {
      tierNome = "Tier A";
      cargoId = tierA;
      cor = "#2ECC71";
    } else {
      tierNome = "Tier S";
      cargoId = tierS;
      cor = "#FFD700";
    }

    if (!db[jogador.id]) {
      db[jogador.id] = {
        usuarioRoblox: usuario,
        medias: []
      };
    }

    db[jogador.id].medias.push(Number(mediaNumero.toFixed(1)));
    saveDB(db);

    const member = await interaction.guild.members.fetch(jogador.id);
    const todosTiers = [tierC, tierB, tierA, tierS];

    for (const id of todosTiers) {
      if (member.roles.cache.has(id)) {
        await member.roles.remove(id);
      }
    }

    await member.roles.add(cargoId);

    const embed = new EmbedBuilder()
      .setColor(cor)
      .setTitle("📋 RESULTADO DE AVALIAÇÃO - NEXUS")
      .setDescription(
        `👤 **Jogador Avaliado:** ${jogador}\n` +
        `🧑‍⚖️ **Avaliador:** ${interaction.user}\n` +
        `🎮 **Usuário do Roblox:** ${usuario}`
      )
      .addFields(
        { name: "⚔️ Corte", value: `${corte}/10`, inline: true },
        { name: "🧱 Block", value: `${block}/10`, inline: true },
        { name: "🎯 Levantamento", value: `${levantamento}/10`, inline: true },
        { name: "🛡️ Recepção", value: `${recepcao}/10`, inline: true },
        { name: "🔥 Saque", value: `${saque}/10`, inline: true },
        { name: "📊 MÉDIA FINAL", value: `⭐ ${media}/10`, inline: false },
        { name: "🏆 Tier Conquistado", value: `🔥 ${tierNome}`, inline: false }
      )
      .setFooter({ text: "Sistema Oficial NEXUS" })
      .setTimestamp();

    await canal.send({
      content: `<@&${cargoId}>`,
      embeds: [embed]
    });

    await interaction.reply({ content: "✅ Resultado salvo e cargo atualizado!", ephemeral: true });
  }

  // ===== DESAFIO =====
  if (interaction.commandName === "desafio") {

    const j1 = interaction.options.getUser("jogador1");
    const j2 = interaction.options.getUser("jogador2");

    if (j1.id === j2.id) {
      return interaction.reply({ content: "❌ Não pode desafiar a mesma pessoa!", ephemeral: true });
    }

    const n1 = Math.floor(Math.random() * 100) + 1;
    const n2 = Math.floor(Math.random() * 100) + 1;

    let resultado;
    if (n1 > n2) resultado = `🏆 Vencedor: ${j1}`;
    else if (n2 > n1) resultado = `🏆 Vencedor: ${j2}`;
    else resultado = "🤝 Empate!";

    const embed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("🔥 DESAFIO X1 - NEXUS")
      .setDescription(
        `${j1} 🎲 ${n1}\n${j2} 🎲 ${n2}\n\n${resultado}`
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

});

client.login(token);
