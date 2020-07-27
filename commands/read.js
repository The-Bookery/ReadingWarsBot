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
      var points = parseInt(result[0].points) + 1;
      var exp = parseInt(result[0].exp) + 50;

      if (result.length == 1) {
        pomStats.sync().then(() => {
          pomStats.findAll({
            where: {
              team: team,
            },
          }).then((teamresult) => {
            var teampoints = teamresult[0].exp + 50;
            pomStats.update(
              { exp: teampoints },
              { where: { team: team } }
            ).then(() => {
              pomMembers.update(
                { points:  points,
                  exp: exp,
                  read: result[0].read + 1 },
                { where: { user: message.author.id } }
              ).then(() => {
                return message.channel.send('You now have one point to use! You also got a bonus of 50 points for your team.');
              }).catch((error) => {
                console.log('Update error: ' + error);
              });
            });
          });
        });
      } else {
        return message.channel.send('Woah! Somehow you aren\'t in the challenge yet! Run `,join` to get started!');
      }
    });
  });
};

module.exports.config = {
  name: 'read',
  aliases: ['r'],
  description: 'Adds one point to your score for later use, and adds a bonus of 50 exp for your team.',
  usage: ['read'],
};