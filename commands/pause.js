const pausedCommands = require('../databaseFiles/pausedCommands');
module.exports.execute = async (client, message, args) => {
  if (message.member.hasPermission('ADMINISTRATOR')) {
    let commands = client.commands;
    if (args[0]) {
      const found = commands.find(element => element.config.name == args[0]);
      if (found) {
        var command = args[0];
        pausedCommands.sync().then(() => {
          pausedCommands.findAll({
            where: {
              name: command
            }
          }).then((result) => {
            if (result.length == 0) {
              pausedCommands.create({
                name: args[0]
              }).then(() => {
                return message.channel.send(`\`b-${args[0]}\` has been paused! It will remain paused until you \`b-unpause\` it.`);
              });
            } else {
              return message.channel.send('That command has already been paused!');
            }
          });
        });
      } else {
        return message.channel.send('That command doesn\'t exist! Check the name, and make sure you don\'t include a prefix.');
      }
    } else {
      return message.channel.send('Please add a command name to pause!');
    }
  } else {
    return message.channel.send(':x: You do not have permission pause a command!');
  }
};
module.exports.config = {
  name: 'pause',
  module: 'Admin',
  aliases: ['pausecommand'],
  description: 'Pauses commands so they can\'t be used by anyone but admins.',
  usage: ['pause [command name]'],
  adminonly: true,
};