const pausedCommands = require('../databaseFiles/pausedCommands');
module.exports.execute = async (client, message) => {
  pausedCommands.sync().then(() => {
    pausedCommands.findAll().then((result) => {
      if (result.length > 0) {
        var paused;
        for (var i = 0; i < result.length; ++i) {
          if (i == 0) paused = '`b-' + result[0].name + '`';
          else paused = paused + ', `b-' + result[0].name + '`';
        }
        return message.channel.send(`**Paused Commands**\n${paused}`);
      } else {
        return message.channel.send('No commands are paused right now!');
      }
    });
  });
};
module.exports.config = {
  name: 'listpaused',
  module: 'General',
  aliases: ['lp'],
  description: 'Lists all paused commands.',
  usage: ['listpaused'],
};