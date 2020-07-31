const config = require('../config.json');
const pausedCommands = require('../databaseFiles/pausedCommands');

module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;
  let prefix = false;
  for (const thisPrefix of config.prefixes) {
    if (message.content.toLowerCase().startsWith(thisPrefix)) prefix = thisPrefix;
  }
  const args = message.content.split(/\s+/g); // Return the message content and split the prefix.
  const command =
    message.content.startsWith(prefix) &&
    args.shift().slice(prefix.length);

  if (command) {
    pausedCommands.sync().then(() => {
      pausedCommands.findAll(
        {
          where: { name: command }
        }
      ).then((result) => {
        const adminPriv = message.member.hasPermission('ADMINISTRATOR');
        if (result.length == 0 || adminPriv) {
          if (result.length > 0) message.channel.send('**Note**: This command is paused, but due to your admin priveledges you have surpassed this.');
          const commandfile =
            client.commands.get(command) ||
            client.commands.get(client.aliases.get(command));

          if (commandfile) {
            commandfile.execute(client, message, args, prefix); // Execute found command
          }
        } else {
          return message.channel.send(':pause_button: Looks like that command has been paused by an admin!');
        }
      });
    });
  }
};