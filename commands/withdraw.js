const pomMembers = require('../databaseFiles/pomMembers');
const pomTeams = require('../databaseFiles/pomTeams');
const config = require('../config.json');

function pluralFinder(requestedcoins) {
  let plural = "coins";
  if (requestedcoins === 1) plural = "coins";
  return plural;
}

module.exports.execute = async (client, message, args) => {
  var requestedcoins;
  if (args[0] && parseInt(args[0])) {
    requestedcoins = Math.floor(parseInt(args[0]));
    if (requestedcoins < 1) {
      return await message.channel.send('You must have a number greater than 0!');
    }
  } else if (!args[1]) {
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
    return await message.channel.send('Not the correct channel! Please go to your team channel.');
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
            team: wordteam
          }
        }).then((teamresult) => {
          if (teamresult[0].coinstash >= requestedcoins) {
            pomMembers.update({
              coins: result[0].coins + requestedcoins
            }, {
              where: {
                user: message.author.id
              }
            }).then(() => {
              pomTeams.update({
                coinstash: teamresult[0].coinstash - requestedcoins
              }, {
                where: {
                  team: wordteam
                }
              }).then(() => {
                var verb = pluralFinder(requestedcoins);
                return message.channel.send(`:white_check_mark: You have withdrew ${requestedcoins} ${verb} from your team's coin stache. You now have a total of ${result[0].coins + requestedcoins} and it has a total of ${teamresult[0].coinstash - requestedcoins}.`);
              });
            });
          } else {
            return message.channel.send(':x: You are trying to take more coins than your team\'s stash has!');
          }
        });
      });
    });
  });
};
module.exports.config = {
  name: 'withdraw',
  aliases: ['with'],
  description: 'Withdraw coins from your team\'s stash!',
  usage: ['withdraw <coins>'],
};