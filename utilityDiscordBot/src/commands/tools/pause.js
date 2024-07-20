const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const RaffleContract = require('../../constants/interact');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause a Raffle 🎫⏸️.')
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
            const contract = new RaffleContract();
            const result = await contract.pauseRaffle(raffleId);
            await interaction.editReply(`Raffle ${raffleId} paused Transaction ID: \`${result.transactionHash}\``);
        } catch (error) {
            await interaction.editReply(`Error pausing the Raffle: \`${error.reason || error.toString()}\``);
        }
    }
}