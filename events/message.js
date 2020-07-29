const config = require('../config.json');
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
    const commandfile =
      client.commands.get(command) ||
      client.commands.get(client.aliases.get(command));

    if (commandfile) {
      commandfile.execute(client, message, args, prefix); // Execute found command
    }
  }
};