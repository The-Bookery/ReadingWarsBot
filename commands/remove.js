const pomMembers = require('../databaseFiles/pomMembers');
const pomTeams = require('../databaseFiles/pomTeams');

module.exports.execute = async (client, message, args) => {
  if (!args[0]) {
    return await message.channel.send("Please add a subcommand!");
  } else {
    if (!args[0] == "user" && !args[0] == "team") {
      if (!parseInt(args[1])) {
        if (args[0] == "user") return await message.channel.send("Please enter a valid user ID to remove from!");
        else if (args[0] == "team" && args[0] == 1 || args[0] == 2 || args[0] == 3) {
          return await message.channel.send("Please enter a valid team number to remove from!");
        }
      }

      if (!args[2] == "coins" && !args[2] == "points") {
        if (args[2] == "coins" && args[0] == "team") return await message.channel.send("You cannot remove coins from a team!");

        return await message.channel.send("Please add a valid item to remove!");
      }

      if (!parseInt(args[3])) {
        return await message.channel.send("Please add a valid amount to remove!");
      }
    }
  }

  var wordteam;

  if (args[1] == 1) {
    wordteam = "one";
  } else if (args[1] == 2) {
    wordteam = "two";
  } else {
    wordteam = "three";
  }

  if (message.member.hasPermission('ADMINISTRATOR')) {
    if (args[0] == "user") {
      pomMembers.findAll({
        where: {
          user: args[1],
        },
      }).then((result) => {
        if (result.length == 1) {
          if (args[2] == "coins") {
            pomMembers.update(
              { coins:  result[0].coins - args[3],},
              { where: { user: args[1] } }
            ).then(() => {
              let plural = "coins have";
              if (requestedcoins === 1) plural = "coin has";
              return message.channel.send(`${args[3]} ${plural} been removed from specified user.`);
            }).catch((error) => {
              console.log('Update error: ' + error);
            });
          } else {
            pomMembers.update(
              { points:  result[0].points - args[3],},
              { where: { user: args[1] } }
            ).then(() => {
              let plural = "points have";
              if (requestedcoins === 1) plural = "point has";
              return message.channel.send(`${args[3]} ${plural} been removed from specified user.`);
            }).catch((error) => {
              console.log('Update error: ' + error);
            });
          }
        }
      });
    } else {
      message.channel.send('**Warning!** THIS CAN MESS EVERYTHING UP! Only use if something has broken. Do you want to proceed? (yes/no)').then((warningmessage) => {
        const filter = m => m.author.id === message.author.id
        && m.content.includes('yes')
        || m.content.includes('yes')
        || m.content.includes('y')
        || m.content.includes('n');
        const collector = warningmessage.channel.createMessageCollector(filter, { time: 15000 });

        collector.on('collect', m => {
          if (m.content.includes('yes') || m.content.includes('y')) {
            pomTeams.findAll({
              where: {
                team: wordteam,
              },
            }).then((result) => {
              if (result.length == 1) {
                console.log(result[0].points);
                pomTeams.update(
                  { points: result[0].points - args[3]},
                  { where: { team: wordteam } }
                ).then(() => {
                  let plural = "points have";
                  if (requestedcoins === 1) plural = "point has";

                  return message.channel.send(`${args[3]} ${plural} been removed from specified team.`);
                }).catch((error) => {
                  console.log('Update error: ' + error);
                });
              }
            });
          }
        });
      });
    }
  }
};

module.exports.config = {
  name: 'remove',
  aliases: [],
  description: 'Removes coins or points from a user.',
  usage: ['remove <user ID> <coins | points> <amount>'],
};