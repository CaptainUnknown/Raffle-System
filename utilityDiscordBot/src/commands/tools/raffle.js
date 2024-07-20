const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const RaffleContract = require('../../constants/interact');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('raffle')
        .setDescription('Get info about a Raffle 🎫ℹ️.')
        .addStringOption((option) =>
            option
                .setName('raffleid')
                .setDescription("Raffle ID to get info about.")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        await interaction.deferReply();
        const id = interaction.options.getString("raffleid");

        try {
            const contract = new RaffleContract();
            const raffleString = await contract.getRaffle(id);
            const rawRaffle = ((raffleString).toString()).split(",");

            if (rawRaffle.length <= 1) {
                return `No raffle found with ID: ${id}`;
            }

            const raffleId = rawRaffle[0];
            const price = rawRaffle[1] / 100000000000000000;
            const endTime = (new Date(rawRaffle[3] * 1000)).toString();
            const winner = rawRaffle[2] ? 'Not Selected Yet' : rawRaffle[4];
            const nftContract = rawRaffle[5];
            const nftTokenId = rawRaffle[6];
            await interaction.editReply(`**Raffle Info**\nRaffle ID: ${raffleId},\nPrice: ${price},\nEnd Time: ${endTime},\nWinner: ${winner},\n*Prize Info:*\n\tNFT Contract: \`${nftContract}\`,\n\tNFT Token ID: ${nftTokenId}`);
        } catch (error) {
            await interaction.editReply(`Error getting raffle: \`${error.reason || error}\``);
            throw error;
        }
    }
}