const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const RaffleContract = require('../../constants/interact');
const crypto = require("node:crypto");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('end')
        .setDescription('End an Ongoing Raffle 🎫🥇.')
        .addStringOption((option) =>
            option
                .setName('raffleid')
                .setDescription("Raffle ID.")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        const raffleId = interaction.options.getString("raffleid");
        await interaction.deferReply();

        try {
            const randomNumBuffer = crypto.randomBytes(4);
            const seed = parseInt(randomNumBuffer.toString('hex'), 16).toString();

            const contract = new RaffleContract();
            const result = await contract.endRaffle(raffleId, seed);
            await interaction.editReply(`Raffle ${raffleId} Ended Transaction ID: \`${result.transactionHash}\``);
            console.log(seed);
            console.log(result);
            await interaction.editReply(`Raffle ${raffleId} Ended Transaction ID: \`${result.transactionHash}\``);

        } catch (error) {
            console.log(error);
            await interaction.editReply(`Error ending the raffle: \`${error.reason || error.toString()}\``);
        }
    }
}