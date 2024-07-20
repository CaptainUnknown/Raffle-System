const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const RaffleContract = require('../../constants/interact');
const crypto = require('node:crypto');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Start a Raffle 🎫✅.')
        .addStringOption((option) =>
            option
                .setName('price')
                .setDescription("Price per ticket in Ethers.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('doopprice')
                .setDescription("Price per ticket in Doop.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('paywith')
                .setDescription("Is it payable with doop or eth ('doop'/'eth')?")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('duration')
                .setDescription("Number of days to run Raffle.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('contract')
                .setDescription("Prize NFT Smart Contract on Ethereum Mainnet.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('l2contract')
                .setDescription("Wrapped NFT Smart Contract on Nova.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('tokenid')
                .setDescription("Prize NFT Token Id.")
                .setRequired(true)
        ),
    async execute(interaction, client) {
        await interaction.deferReply();

        const price = interaction.options.getString("price");
        const doopPrice = interaction.options.getString("doopprice");
        const method = interaction.options.getString("paywith");
        console.log(`method: ${method}`)
        console.log(`method: ${method.toLowerCase() === 'doop' }`)
        console.log(`method: ${doopPrice === ''}`)
        console.log(`method: ${doopPrice >= 0}`)
        console.log(`method: ${method.toLowerCase() === 'doop' && (doopPrice === '' || doopPrice >= 0)}`)
        const duration = interaction.options.getString("duration");
        const prizeContract = interaction.options.getString("contract");
        const prizeContract_L2 = interaction.options.getString("l2contract");
        const prizeTokenId = interaction.options.getString("tokenid");
        // Days in seconds + 10-min padded delay
        const delay = ((duration * 24 * 60 * 60) + (60 * 10)) * 1000;
        let raffleIDs = [];

        if (duration < 1) {
            await interaction.editReply('Duration must be at least 1 day.');
            return;
        } else if (prizeContract === '' || prizeContract.length !== 42) {
            await interaction.editReply('Invalid NFT prize contract address.');
            return;
        } else if (prizeTokenId < 0) {
            await interaction.editReply('Invalid NFT prize token id.');
            return;
        } else if (method === '' || (method.toLowerCase() !== 'eth' && method.toLowerCase() !== 'doop')) {
            await interaction.editReply('Please select a payment method. Expected: `eth` or `doop`.');
            return;
        } else if (method.toLowerCase() === 'eth' && (price === '' || price <= 0)) {
            await interaction.editReply('Please specify a price in ETH.');
            return;
        } else if (method.toLowerCase() === 'doop' && (doopPrice === '' || doopPrice <= 0)) {
            await interaction.editReply('Please specify a price in DOOP.');
            return;
        }

        try {
            let payableWithDoop;
            if (method.toLowerCase() === 'doop' || method.toLowerCase() === 'd') {
                payableWithDoop = true;
            } else if (method.toLowerCase() === 'eth' || method.toLowerCase() === 'e') {
                payableWithDoop = false;
            }

            const contract = new RaffleContract();
            // uint128 _priceInEth
            // uint128 _doopPrice
            // bool _payableWithDoop
            // uint64 _duration
            // address _prizeNFTContract_mainnet
            // address _prizeNFTContract_bridged
            // uint32 _prizeNFTTokenId_mainnet
            // uint32 _prizeNFTTokenId_bridged
            const result = await contract.startRaffle(price, doopPrice, payableWithDoop, duration, prizeContract, prizeContract_L2, prizeTokenId, prizeTokenId);
            raffleIDs = await contract.getRaffleIDs();
            console.log(result);
            console.log(raffleIDs[raffleIDs.length - 1]);
            await interaction.editReply(`
            Raffle Started Transaction ID: \`${result.transactionHash}\`\n Raffle ID: \`${raffleIDs[raffleIDs.length - 1]}\`\n
            Raffle end automatically scheduled for T-minus: \`~${delay/1000} seconds.\`
            `);

            // await interaction.editReply(`Raffle Started Transaction ID: \`${'DEBUG'}\`\nRaffle ID: \`${'DEBUG'}\`\nRaffle end automatically scheduled for T-minus: \`~${delay / 1000} seconds.\``);
        } catch (error) {
            console.log(error);
            await interaction.editReply(`Error: \`${error.reason || error.toString()}\``);
        }

        try {
            await new Promise((resolve) => { setTimeout(() => resolve(), delay) });
            const raffleId = raffleIDs[raffleIDs.length - 1];
            const randomNumBuffer = crypto.randomBytes(4);
            const randomNumString = parseInt(randomNumBuffer.toString('hex'), 16).toString();

            const contract = new RaffleContract();
            const result = await contract.endRaffle(raffleId, randomNumString);
            console.log(`Raffle ${raffleId} Ended Transaction ID: \`${result.transactionHash}\``);
        } catch (error) {
            console.log(`Error: ${error.reason || error }`);
        }
    }
}