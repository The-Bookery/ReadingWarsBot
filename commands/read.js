const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomTeams = require('../databaseFiles/pomTeams');

module.exports.execute = async (client, message, args) => {
  var requestedcoins;
  if (args[0] && parseInt(args[0])) {
    requestedcoins = Math.floor(parseInt(args[0]));
    console.log(requestedcoins);
    if (requestedcoins < 1) {
      return await message.channel.send('You must have a number greater than 0!');
    }
  } else if (!args[0]) {
    requestedcoins = 1;
  } else {
    return await message.channel.send('Looks like you didn\'t input a proper number! Try again.');
  }

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
      var coins = parseInt(result[0].coins) + requestedcoins;
      var points = parseInt(result[0].points) + (requestedcoins * 50);

      if (result.length == 1) {
        pomTeams.sync().then(() => {
          pomTeams.findAll({
            where: {
              team: team,
            },
          }).then((teamresult) => {
            var teamcoins = teamresult[0].points + (requestedcoins * 50);
            pomTeams.update(
              { points: teamcoins,
                read: teamresult[0].read + requestedcoins },
              { where: { team: team } }
            ).then(() => {
              pomMembers.update(
                { coins:  coins,
                  points: points,
                  read: result[0].read + requestedcoins },
                { where: { user: message.author.id } }
              ).then(() => {
                let plural = "coins";
                console.log(result[0].coins + requestedcoins);
                if (result[0].coins + requestedcoins == 1) plural = "coin";
                return message.channel.send(`:book: You now have ${result[0].coins + requestedcoins} ${plural} to use! You also got a bonus of ${requestedcoins * 50} points for your team.`);
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
  description: 'Adds coins to your score for later use, and adds a bonus of 50 points per coin for your team. Optional entry for how many reads you\'ve done.',
  usage: ['read [times]'],
};