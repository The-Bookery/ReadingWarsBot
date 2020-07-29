const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomTeams = require('../databaseFiles/pomTeams');

module.exports.execute = async (client, message, args) => {
  var requestedpoints;
  if (args[0] && parseInt(args[0])) {
    requestedpoints = Math.floor(parseInt(args[0]));
    console.log(requestedpoints);
    if (requestedpoints < 1) {
      return await message.channel.send('You must have a number greater than 0!');
    }
  } else if (!args[0]) {
    requestedpoints = 1;
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
      var points = parseInt(result[0].points) + requestedpoints;
      var exp = parseInt(result[0].exp) + (requestedpoints * 50);

      if (result.length == 1) {
        pomTeams.sync().then(() => {
          pomTeams.findAll({
            where: {
              team: team,
            },
          }).then((teamresult) => {
            var teampoints = teamresult[0].exp + (requestedpoints * 50);
            pomTeams.update(
              { exp: teampoints,
                read: teamresult[0].read + requestedpoints },
              { where: { team: team } }
            ).then(() => {
              pomMembers.update(
                { points:  points,
                  exp: exp,
                  read: result[0].read + requestedpoints },
                { where: { user: message.author.id } }
              ).then(() => {
                return message.channel.send(`You now have ${result[0].points + requestedpoints} points to use! You also got a bonus of ${requestedpoints * 50} points for your team.`);
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
  description: 'Adds points to your score for later use, and adds a bonus of 50 exp per read for your team. Optional entry for how many reads you\'ve done.',
  usage: ['read [points]'],
};