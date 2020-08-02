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
    let commands = client.commands;
    var maincommand;

    commands.forEach((requestedcommand) => {
      if (requestedcommand.config.name === command) {
        maincommand = requestedcommand.config.name;
      } else if (requestedcommand.config.aliases.includes(command)) {
        maincommand = requestedcommand.config.name;
      }
    });

    pausedCommands.sync().then(() => {
      pausedCommands.findAll(
        {
          where: { name: maincommand }
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