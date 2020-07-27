const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomStats = require('../databaseFiles/pomStats');

module.exports.execute = async (client, message, args) => {
  var team;

  if (message.channel.id === config.channels.teamOne) {
    team = 1;
  } else if (message.channel.id === config.channels.teamTwo) {
    team = 2;
  } else if (message.channel.id === config.channels.teamThree) {
    team = 3;
  } else {
    return await message.channel.send('Not the correct channel!');
  }

  if (args[0] != 1 && args[0] != 2 && args[0] != 3) {
    return await message.channel.send('Looks like you didn\'t target a team!');
  }

  var target = args[0];

  if (target == team) {
    return await message.channel.send('You can\'t target your own team!');
  }

  pomMembers.sync().then(() => {
    pomMembers.findAll({
      where: {
        user: message.author.id,
      },
    }).then((result) => {
      if (result.length == 1) {
        var points = parseInt(result[0].points);

        if (points > 0) {
          points -= 1;

          pomStats.sync().then(() => {
            var wordteam;

            if (target == 1) {
              wordteam = "one";
            } else if (target == 2) {
              wordteam = "two";
            } else {
              wordteam = "three";
            }

            pomStats.findAll({
              where: {
                team: wordteam,
              },
            }).then((targetresult) => {
              var newWalls = targetresult[0].walls - 3;
              if (newWalls < 0) newWalls = 0;
              pomStats.update(
                { walls: newWalls },
                { where: { team: wordteam } }
              ).then(() => {
                pomMembers.update(
                  { points: points,
                    bomb: result[0].bomb + 1 },
                  { where: { user: message.author.id } }
                ).then(() => {
                  return message.channel.send(`You have destroyed team ${target}'s walls. Their walls are now at ${newWalls}! You lost 1 point in the process and now have ${result[0].points - 1}.`);
                }).catch((error) => {
                  console.log('Update error: ' + error);
                });
              });
            });
          });
        } else {
          return message.channel.send(`You don't have enough points for this! You only have ${result[0].points} points.`);
        }
      } else {
        return message.channel.send('Woah! Somehow you aren\'t in the challenge yet! Run `,join` to get started!');
      }
    });
  });
};

module.exports.config = {
  name: 'bomb',
  aliases: [],
  description: 'Breaks down three walls at a time.',
  usage: ['bomb [team number]'],
};