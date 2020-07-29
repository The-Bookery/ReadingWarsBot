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
      pomTeams.sync().then(() => {
        pomTeams.findAll({
          where: {
            team: wordteam,
          },
        }).then((teamresult) => {
          var bonus = 0;

          if (result[0].class == "thief") {
            for(var i = 0; i < requestedpoints; ++i){
              var random = Math.floor(Math.random() * 10);
              if (random == 9) bonus += 1;
            }
          }

          var newPoints = result[0].points - requestedpoints + bonus;
          if (newPoints < 0) {
            return message.channel.send(`Looks like you don't have that many points! You currently have ${result[0].points}.`);
          }

          var newExp = result[0].exp + (requestedpoints * 100);
          var joker = "";
          if (result[0].class == "joker" && Math.floor(Math.random() * 10) == 9) {newExp = newExp + requestedpoints * 50; joker = ", with a 50% bonus from your joker class";}
          var newTeamExp = teamresult[0].exp + (requestedpoints * 100);

          pomMembers.update(
            { exp: newExp,
              points: newPoints,
              tradein: result[0].tradein + 1 },
            { where: { user: message.author.id } }
          ).then(() => {
            pomTeams.update(
              { exp: newTeamExp,
                tradein: teamresult[0].tradein + 1 },
              { where: { team: wordteam } }
            ).then(() => {
              let plural = (requestedpoints === 1) ? "point" : "points";
              let thief = "";
              if (bonus > 0) thief = `, stealing ${bonus} points back,`;
              return message.channel.send(`You have traded in ${requestedpoints - bonus} ${plural}${thief} for ${newExp - result[0].exp} exp${joker}. You now have a total of ${newExp} and your team has a total of ${newTeamExp}.`);
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