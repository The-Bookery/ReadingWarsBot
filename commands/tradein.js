const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomTeams = require('../databaseFiles/pomTeams');

function pluralFinder(requestedcoins) {
  let plural = "coins";
  if (requestedcoins === 1)
    plural = "coins";
  return plural;
}

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
            for(var i = 0; i < requestedcoins; ++i){
              var random = Math.floor(Math.random() * 10);
              if (random == 9) bonus += 1;
            }
          }

          var newCoins = result[0].coins - requestedcoins + bonus;
          if (newCoins < 0) {
            return message.channel.send(`:x: Looks like you don't have that many coins! You currently have ${result[0].coins}.`);
          }

          var newPoints = result[0].points + (requestedcoins * 50);
          var joker = "";
          if (result[0].class == "joker" && Math.floor(Math.random() * 10) == 9) {newPoints = newPoints + requestedcoins * 50; joker = ", with a 50% bonus from your joker class";}
          var newTeamPoints = teamresult[0].points + (requestedcoins * 50);

          pomMembers.update(
            { points: newPoints,
              coins: newCoins,
              tradein: result[0].tradein + 1 },
            { where: { user: message.author.id } }
          ).then(() => {
            pomTeams.update(
              { points: newTeamPoints,
                tradein: teamresult[0].tradein + 1 },
              { where: { team: wordteam } }
            ).then(() => {
              let plural = pluralFinder(requestedcoins);
              let thief = "";
              if (bonus > 0) thief = `, stealing ${bonus} coins back,`;
              return message.channel.send(`:handshake: You have traded in ${requestedcoins - bonus} ${plural}${thief} for ${newPoints - result[0].points} points${joker}. You now have a total of ${newPoints} and your team has a total of ${newTeamPoints}.`);
            });
          });
        });
      });
    });
  });
};

module.exports.config = {
  name: 'tradein',
  aliases: ['tradein'],
  description: 'Trade in any amount of coins at a rate of 50 points per coin!',
  usage: ['tradein [coins (leave blank for 1)]'],
};