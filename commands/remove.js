const pomMembers = require('../databaseFiles/pomMembers');

module.exports.execute = async (client, message, args) => {
  if (!args[0]) {
    return await message.channel.send("Please add a subcommand!");
  } else {
    if (!parseInt(args[0])) {
      return await message.channel.send("Please add a valid user ID to remove from!");
    }

    if (!args[1] == "points" && !args[1] == "exp") {
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
        if (args[1] == "points") {
          pomMembers.update(
            { points:  result[0].points - args[2],},
            { where: { user: args[0] } }
          ).then(() => {
            return message.channel.send(`${args[2]} points have been removed from specified user.`);
          }).catch((error) => {
            console.log('Update error: ' + error);
          });
        } else {
          pomMembers.update(
            { exp:  result[0].exp - args[2],},
            { where: { user: args[0] } }
          ).then(() => {
            return message.channel.send(`${args[2]} exp has been removed from specified user.`);
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
  description: 'Removes points or exp from a user.',
  usage: ['remove <user ID> <points | exp> <amount>'],
};