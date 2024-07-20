const dotenv = require('dotenv');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { readdirSync } = require('fs');

dotenv.config();
const token = "";
const client = new Client({ intents: GatewayIntentBits.Guilds });

client.commands = new Collection();
client.selectMenus = new Collection();
client.commandArray = [];

const functionFolders = readdirSync('./src/functions');
for (const folder of functionFolders) {
    const functionFiles = readdirSync(`./src/functions/${folder}`).filter(file => file.endsWith('.js'));

    for (const file of functionFiles)
        require(`./functions/${folder}/${file}`)(client);
}

client.handleEvents();
client.handleCommands();
client.handleComponents();
client.login(token);