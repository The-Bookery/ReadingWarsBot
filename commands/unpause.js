const pausedCommands = require('../databaseFiles/pausedCommands');
module.exports.execute = async (client, message, args) => {
  if (message.member.hasPermission('ADMINISTRATOR')) {
    if (args[0]) {
      var command = args[0];
      pausedCommands.sync().then(() => {
        pausedCommands.findAll({
          where: {
            name: command
          }
        }).then((result) => {
          if (result.length > 0) {
            pausedCommands.destroy({
              where: {
                name: command
              }
            }).then(() => {
              return message.channel.send('That command has been unpaused! It can now be used by anyone.');
            });
          } else {
            return message.channel.send('That command is not paused!');
          }
        });
      });
    } else {
      return message.channel.send('Please add a command name to unpause!');
    }
  } else {
    return message.channel.send(':x: You do not have permission unpause a command!');
  }
};
module.exports.config = {
  name: 'unpause',
  aliases: ['unpausecommand'],
  description: 'Unpauses commands so they can be used by everyone.',
  usage: ['unpause [command name]'],
  adminonly: true,
};