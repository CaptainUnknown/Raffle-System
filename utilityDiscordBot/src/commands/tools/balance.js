const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const RaffleContract = require('../../constants/interact');
const crypto = require('node:crypto');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Get admin Wallet Balance 💵.'),
    async execute(interaction, client) {
        await interaction.deferReply();

        try {
            const contract = new RaffleContract();
            const balance = await contract.getBalance();
            await interaction.editReply(`Balance: \`${balance}\``);
        } catch (error) {
            console.log(error);
            await interaction.editReply(`Failed to get Balance: \`${error.reason || error}\``);
        }
    }
}