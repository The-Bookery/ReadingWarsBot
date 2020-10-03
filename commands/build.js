const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomTeams = require('../databaseFiles/pomTeams');

// call function with variables timestamp1 and timestamp2 in call
function timedifference(timestamp1, timestamp2) {
  // redefine the variables
  timestamp1 = new Date(parseInt(timestamp1));
  timestamp2 = new Date(parseInt(timestamp2));
  let difference = timestamp2.getTime() - timestamp1.getTime();
  difference = Math.floor(difference / 1000);
  return difference;
}

module.exports.execute = async (client, message) => {
  var team;
  if (message.channel.id === config.channels.teamOne) {
    team = "one";
  } else if (message.channel.id === config.channels.teamTwo) {
    team = "two";
  } else if (message.channel.id === config.channels.teamThree) {
    team = "three";
  } else {
    return await message.channel.send('Not the correct channel! Please go to your team channel.');
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
          walls = 6;
        }
        if (coins >= penalty) {
          // To prevent spam abuse, these two are after the check
          var special = "";
          if (result[0].class == "thief" && Math.floor(Math.random() * 10) + 1 > 8) {
            penalty = 0;
            special = " because of your skills as a thief";
          } else if (result[0].class == "joker" && Math.floor(Math.random() * 9) + 1 > 5) {
            penalty = 0;
            special = " because of your skills as a joker";
          }
          coins -= penalty;
          console.log(coins);
          pomTeams.sync().then(() => {
            pomTeams.findAll({
              where: {
                team: team,
              },
            }).then((teamresult) => {
              if (timedifference(teamresult[0].wallcooldown, Date.now()) >= 180) {
                if (teamresult[0].walls < walls) {
                  pomTeams.update({
                    walls: walls,
                    build: teamresult[0].build + 1,
                    wallcooldown: Date.now()
                  }, {
                    where: {
                      team: team
                    }
                  }).then(() => {
                    pomMembers.update({
                      coins: coins,
                      build: result[0].build + 1
                    }, {
                      where: {
                        user: message.author.id
                      }
                    }).then(() => {
                      if (walls == 7) walls = "6 (a bonus for being a stonemason)";
                      let plural = "coins";
                      if (penalty === 1) plural = "coin";
                      return message.channel.send(`:european_castle: You have restored your team's walls to ${walls} from ${teamresult[0].walls}! You lost ${penalty} ${plural} in the process${special}, and now have ${coins}.`);
                    }).catch((error) => {
                      console.log('Update error: ' + error);
                    });
                  });
                } else {
                  return message.channel.send('Looks like you can\'t build the walls up any more! You have been saved your coin.');
                }
              } else {
                return message.channel.send(`:x: Your team built a wall in the past five minutes! Please wait ${180 - timedifference(teamresult[0].wallcooldown, Date.now())} more minutes!`);
              }
            });
          });
        } else {
          return message.channel.send(`:x: You don't have enough coins for this! You only have ${result[0].coins} coins.`);
        }
      } else {
        return message.channel.send('Woah! Somehow you aren\'t in the challenge yet! Run `b-join` to get started!');
      }
    });
  });
};
module.exports.config = {
  name: 'build',
  module: 'Game',
  aliases: ['b'],
  description: 'Builds up to 4 walls for 2 coins. The Stonemason class can build up to 6 walls. The construction time (i.e. cooldown) of the walls after being attacked is three minutes, which leaves you vulnerable to any attacks after being bombed.',
  usage: ['build'],
};