const pomBans = require('../databaseFiles/pomBans');

module.exports.execute = async (client, message, args) => {
  if (!args[0]) {
    return await message.channel.send("Please add a subcommand!");
  }

  if (message.member.hasPermission('ADMINISTRATOR')) {
    pomBans.sync().then(() => {
      pomBans.destroy({
        where: {
          user: args[0]
        }
      }).then(() => {
        return message.channel.send('User has been unbanned and can rejoin at their choosing.');
      });
    });
  } else {
    return message.channel.send('You do not have permission to unban a user from the challenge!');
  }
};

module.exports.config = {
  name: 'unban',
  aliases: ['unbanuser'],
  description: 'Allows a user to join after being banned.',
  usage: ['unban [user ID]'],
};