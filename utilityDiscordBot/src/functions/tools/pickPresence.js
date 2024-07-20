const { ActivityType } = require('discord.js');

module.exports = (client) => {
    client.pickPresence = async () => {
        const options = {
            type: ActivityType.Playing,
            text: "with Iluma Cards!",
            status: 'online'
        };

        await client.user.setPresence({
            activities: [
                {
                    name: options.text,
                    type: options.type,
                },
            ],
            status: options.status
        });
    }
}