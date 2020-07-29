const pomMembers = require('../databaseFiles/pomMembers');

module.exports.execute = async (client, message, args) => {
  if (!args[0]) {
    return await message.channel.send("Please add a subcommand!");
  } else {
    if (!parseInt(args[0])) {
      return await message.channel.send("Please add a valid user ID to remove from!");
    }

    if (!args[1] == "coins" && !args[1] == "points") {
      return await message.channel.send("Please add a valid item to remove!");
    }

    if (!parseInt(args[2])) {
      return await message.channel.send("Please add a valid amount to remove!");
    }
  }

  if (message.member.hasPermission('ADMINISTRATOR')) {
    pomMembers.findAll({
      where: {
        user: args[0],
      },
    }).then((result) => {
      if (result.length == 1) {
        if (args[1] == "coins") {
          pomMembers.update(
            { coins:  result[0].coins - args[2],},
            { where: { user: args[0] } }
          ).then(() => {
            return message.channel.send(`${args[2]} coins have been removed from specified user.`);
          }).catch((error) => {
            console.log('Update error: ' + error);
          });
        } else {
          pomMembers.update(
            { points:  result[0].points - args[2],},
            { where: { user: args[0] } }
          ).then(() => {
            return message.channel.send(`${args[2]} points has been removed from specified user.`);
          }).catch((error) => {
            console.log('Update error: ' + error);
          });
        }
      }
    });
  }
};

module.exports.config = {
  name: 'remove',
  aliases: [],
  description: 'Removes coins or points from a user.',
  usage: ['remove <user ID> <coins | points> <amount>'],
};