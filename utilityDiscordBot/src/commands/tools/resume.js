const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const RaffleContract = require('../../constants/interact');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume a Raffle 🎫⏸️.')
        .addStringOption((option) =>
            option
                .setName('raffleid')
                .setDescription("Raffle ID.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('toincreasetime')
                .setDescription("Whether to increase the time or not?")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('addedtime')
                .setDescription("How much time to increase (in hours)?")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        const raffleId = interaction.options.getString("raffleid");
        const toIncreaseTimeArg = interaction.options.getString("toincreasetime");
        const _addedTime = interaction.options.getString("addedtime");
        await interaction.deferReply();

        if (toIncreaseTimeArg === 'true' || toIncreaseTimeArg === 'false') {
            await interaction.editReply('toincreasetime should either be true or false. must be at least 1 day.');
            return;
        } else if (toIncreaseTimeArg === 'false' || _addedTime !== 0) {
            await interaction.editReply('Conflicting arguments. 0 increase in time requested. Set toincreasetime to false, to keep the end time same as before.');
            return;
        } else if (_addedTime < 0) {
            await interaction.editReply('Invalid addedtime, the addedtime must be greater than 0.');
            return;
        }

        try {
            const toIncreaseTime = toIncreaseTimeArg === 'true';
            const contract = new RaffleContract();
            const result = await contract.resumeRaffle(raffleId, toIncreaseTime, _addedTime);
            await interaction.editReply(`Raffle ${raffleId} resumed with ${toIncreaseTime ? `added time of ${_addedTime} hours`: `no added time`}. Transaction ID: \`${result.transactionHash}\``);
        } catch (error) {
            await interaction.editReply(`Error pausing the Raffle: \`${error.reason || error.toString()}\``);
        }
    }
}