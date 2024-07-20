const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const RaffleContract = require('../../constants/interact');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getended')
        .setDescription('Get all completed or ended raffles 🕑.'),
    async execute(interaction, client) {
        try {
            await interaction.deferReply();
            const contract = new RaffleContract();
            const endedRaffles = await contract.getEndedRaffles();
            const ended = ((endedRaffles).toString()).split(",");

            if (ended.length <= 1) {
                await interaction.editReply(`No ended raffles found.`);
                return;
            }

            await interaction.editReply('**Ended Raffles:**');
            for (let i = 0; i < ended.length; i += 10) {
                const raffleId = ended[i];
                const price = ended[i+1] / 1000000000000000000;
                const doopPrice = ended[i+2] / 1000000000000000000;
                const payableWithDoop = ended[i+5];
                const endTime = (new Date(ended[i+3] * 1000)).toString();
                const winner = ended[i+7] ? 'Not Yet Selected' : ended[i+7];
                const nftContract = ended[i+8];
                const nftTokenId = ended[i+9];
                const raffle = payableWithDoop ?
                    `Raffle ID: ${raffleId},\nDoop Price: ${doopPrice},\nEnd Time: ${endTime},\nWinner: ${winner},\n*Prize Info:*\n\tNFT Contract: \`${nftContract}\`,\n\tNFT Token ID: ${nftTokenId}\n\n------------------------`
                    :
                    `Raffle ID: ${raffleId},\nPrice: ${price},\nEnd Time: ${endTime},\nWinner: ${winner},\n*Prize Info:*\n\tNFT Contract: \`${nftContract}\`,\n\tNFT Token ID: ${nftTokenId}\n\n------------------------`;
                await interaction.followUp(`\n\n${raffle}`);
            }
        } catch (error) {
            await interaction.editReply(`Error getting raffles: \`${error.reason || error}\``);
        }
    }
}