const { InteractionType } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const { commands } = client;
            const { commandName } = interaction;
            const command = commands.get(commandName);

            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'This wasn\'t supposed to happen 😦! Report the issue to @Team', ephemeral: true });
            }
        } else if (interaction.isSelectMenu()) {
            const { selectMenus } = client;
            const { customId } = interaction;
            const menu = selectMenus.get(customId);

            if(!menu) return new Error(`No handler code for select menu: ${customId}`);

            try{
                await menu.execute(interaction, client);
            }
            catch(err) {
                console.error(err);
            }
        } else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
            const { commands } = client;
            const { commandName } = interaction;
            const command = commands.get(commandName);

            if(!command) return new Error(`No handler code for auto complete command: ${commandName}`);

            try{
                await command.autocomplete(interaction, client);
            }
            catch(err) {
                console.error(err);
            }
        }
    }
}