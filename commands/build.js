const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomTeams = require('../databaseFiles/pomTeams');

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
        var coins = parseInt(result[0].coins);
        var walls = 4;
        var penalty = 2;

        if (result[0].class == "stonemason") {
          penalty = 1;
          walls = 7;
        }

        if (coins >= penalty) {
          // To prevent spam abuse, these two are after the check
          var special = "";
          if (result[0].class == "thief" && Math.floor(Math.random() * 10) > 9) {
            penalty = 0;
            special = " because of your skills as a thief";
          } else if (result[0].class == "joker" && Math.floor(Math.random() * 9) > 4) {
            penalty = 0;
            special = " because of your skills as a joker";
          }

          coins -= penalty;

          pomTeams.sync().then(() => {
            pomTeams.findAll({
              where: {
                team: team,
              },
            }).then((teamresult) => {
              pomTeams.update(
                { walls: walls,
                  build: teamresult[0].build + 1 },
                { where: { team: team } }
              ).then(() => {
                pomMembers.update(
                  { coins: coins,
                    build: result[0].build + 1 },
                  { where: { user: message.author.id } }
                ).then(() => {
                  if (walls == 6) walls = "6 (a bonus for being a stonemason)";

                  return message.channel.send(`You have restored your team's walls to ${walls} from ${teamresult[0].walls}! You lost ${penalty} coins in the process${special}, and now have ${coins}.`);
                }).catch((error) => {
                  console.log('Update error: ' + error);
                });
              });
            });
          });
        } else {
          return message.channel.send(`You don't have enough coins for this! You only have ${result[0].coins} coins.`);
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