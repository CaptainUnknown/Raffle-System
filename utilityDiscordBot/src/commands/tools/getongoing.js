const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const RaffleContract = require('../../constants/interact');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getongoing')
        .setDescription('Get all on going raffles 🤖.'),
    async execute(interaction, client) {
        try {
            await interaction.deferReply();
            const contract = new RaffleContract();
            const onGoingRaffles = await contract.getOnGoingRaffles();
            const onGoing = ((onGoingRaffles).toString()).split(",");

            if (onGoing.length <= 1) {
                await interaction.editReply(`No ongoing raffles found.`);
                return;
            }

            await interaction.editReply('**Ongoing Raffles:**');
            for (let i = 0; i < onGoing.length; i += 10) {
                const raffleId = onGoing[i];
                const price = onGoing[i+1] / 1000000000000000000;
                const doopPrice = onGoing[i+2] / 1000000000000000000;
                const payableWithDoop = onGoing[i+5];
                const endTime = (new Date(onGoing[i+3] * 1000)).toString();
                const winner = onGoing[i+7] ? 'Not Yet Selected' : onGoing[i+7];
                const nftContract = onGoing[i+8];
                const nftTokenId = onGoing[i+9];
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