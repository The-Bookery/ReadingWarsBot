const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomStats = require('../databaseFiles/pomStats');

module.exports.execute = async (client, message) => {
  var team;

  if (message.channel.id === config.channels.teamOne) {
    team = "one";
  } else if (message.channel.id === config.channels.teamTwo) {
    team = "two";
  } else if (message.channel.id === config.channels.teamThree) {
    team = "three";
  } else {
    return await message.channel.send('Not the correct channel!');
  }

  pomMembers.sync().then(() => {
    pomMembers.findAll({
      where: {
        user: message.author.id,
      },
    }).then((result) => {
      if (result.length == 1) {
        var points = parseInt(result[0].points);

        if (points > 1) {
          points -= 2;

          pomStats.sync().then(() => {
            pomStats.findAll({
              where: {
                team: team,
              },
            }).then((teamresult) => {
              pomStats.update(
                { walls: 4 },
                { where: { team: team } }
              ).then(() => {
                pomMembers.update(
                  { points: points,
                    build: result[0].build + 1 },
                  { where: { user: message.author.id } }
                ).then(() => {
                  return message.channel.send(`You have restored your team's walls to 4 from ${teamresult[0].walls}! You lost 2 points in the process and now have ${result[0].points - 2}.`);
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
  name: 'build',
  aliases: ['b'],
  description: 'Restores your team\'s walls to 4 in exchange for 2 exp.',
  usage: ['read'],
};