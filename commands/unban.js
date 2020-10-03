const pomBans = require('../databaseFiles/pomBans');
module.exports.execute = async (client, message, args) => {
  if (!args[0]) {
    return await message.channel.send("Please add a subcommand!");
  }
  if (!parseInt(args[0])) {
    return await message.channel.send("Please make sure you use a user ID!");
  }
  if (message.member.hasPermission('ADMINISTRATOR')) {
    pomBans.sync().then(() => {
      pomBans.findAll({
        where: {
          user: args[0]
        }
      }).then((result) => {
        if (result.length == 1) {
          pomBans.destroy({
            where: {
              user: args[0]
            }
          }).then(() => {
            return message.channel.send('User has been unbanned and can rejoin at their choosing.');
          });
        } else {
          return message.channel.send('Looks like that user isn\'t banned. Make sure you have the user ID correct!');
        }
      });
    });
  } else {
    return message.channel.send('You do not have permission to unban a user from the challenge!');
  }
};
module.exports.config = {
  name: 'unban',
  module: 'Admin',
  aliases: ['unbanuser'],
  description: 'Allows a user to join after being banned.',
  usage: ['unban [user ID]'],
  adminonly: true,
};