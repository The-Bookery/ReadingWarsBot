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
            return message.channel.send(`Looks like you don't have that many coins! You currently have ${result[0].coins}.`);
          }

          var newExp = result[0].points + (requestedcoins * 100);
          var joker = "";
          if (result[0].class == "joker" && Math.floor(Math.random() * 10) == 9) {newExp = newExp + requestedcoins * 50; joker = ", with a 50% bonus from your joker class";}
          var newTeamExp = teamresult[0].points + (requestedcoins * 100);

          pomMembers.update(
            { points: newExp,
              coins: newCoins,
              tradein: result[0].tradein + 1 },
            { where: { user: message.author.id } }
          ).then(() => {
            pomTeams.update(
              { points: newTeamExp,
                tradein: teamresult[0].tradein + 1 },
              { where: { team: wordteam } }
            ).then(() => {
              let plural = (requestedcoins === 1) ? "coin" : "coins";
              let thief = "";
              if (bonus > 0) thief = `, stealing ${bonus} coins back,`;
              return message.channel.send(`You have traded in ${requestedcoins - bonus} ${plural}${thief} for ${newExp - result[0].points} points${joker}. You now have a total of ${newExp} and your team has a total of ${newTeamExp}.`);
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
  description: 'Trade in an amount of coins at a rate of 100 points per coin!',
  usage: ['tradein [coins (leave blank for 1)]'],
};