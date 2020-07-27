const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomStats = require('../databaseFiles/pomStats');

module.exports.execute = async (client, message, args) => {
  var requestedpoints;
  if (args[0] && parseInt(args[0])) {
    requestedpoints = args[0];
  } else if (!args[0]) {
    requestedpoints = 1;
  } else {
    return await message.channel.send('Looks like you didn\'t input a proper number! Try again.');
  }

  var wordteam;

  if (message.channel.id === config.channels.teamOne) {
    wordteam = "one";
  } else if (message.channel.id === config.channels.teamTwo) {
    wordteam = "two";
  } else if (message.channel.id === config.channels.teamThree) {
    wordteam = "three";
  } else {
    return await message.channel.send('Not the correct channel!');
  }


  pomMembers.sync().then(() => {
    pomMembers.findAll({
      where: {
        user: message.author.id,
      },
    }).then((result) => {
      pomStats.sync().then(() => {
        pomStats.findAll({
          where: {
            team: wordteam,
          },
        }).then((teamresult) => {
          //
          var newPoints = result[0].points - requestedpoints;
          if (newPoints < 0) {
            return message.channel.send(`Looks like you don't have that many points! You currently have ${result[0].points}.`);
          }

          var newExp = result[0].exp + (requestedpoints * 100);
          var newTeamExp = teamresult[0].exp + (requestedpoints * 100);

          pomMembers.update(
            { exp: newExp,
              tradein: result[0].tradein + 1 },
            { where: { user: message.author.id } }
          ).then(() => {
            pomStats.update(
              { exp: newTeamExp },
              { where: { team: wordteam } }
            ).then(() => {
              let plural = (requestedpoints == 1) ? "point" : "points";
              return message.channel.send(`You have traded in ${requestedpoints} ${plural} for ${requestedpoints * 100} exp. You now have a total of ${newExp} and your team has a total of ${newTeamExp}.`);
            });
          });
        });
      });
    });
  });
};

module.exports.config = {
  name: 'tradein',
  aliases: [],
  description: 'Trade in an amount of points at a rate of 100 exp per point!',
  usage: ['tradein [points (leave blank for 1)]'],
};