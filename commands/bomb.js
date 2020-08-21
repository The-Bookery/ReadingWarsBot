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

module.exports.execute = async (client, message, args) => {
  var team;
  var wordteam;
  if (message.channel.id === config.channels.teamOne) {
    team = 1;
    wordteam = "one";
  } else if (message.channel.id === config.channels.teamTwo) {
    team = 2;
    wordteam = "two";
  } else if (message.channel.id === config.channels.teamThree) {
    team = 3;
    wordteam = "three";
  } else {
    return await message.channel.send('Not the correct channel! Please go to your team channel.');
  }
  if (args[0] != 1 && args[0] != 2 && args[0] != 3) {
    return await message.channel.send('Looks like you didn\'t target a team!');
  }
  var target = args[0];
  if (target == team) {
    return await message.channel.send('You can\'t target your own team!');
  }
  if (target != 1 && target != 2 && target != 3) {
    return await message.channel.send('Looks like your target isn\'t valid!');
  }
  var generatedRandom = Math.floor(Math.random() * 100) + 1;
  var damage;

  if (generatedRandom <= 10) damage = 0;
  else if (generatedRandom > 10 && generatedRandom <= 35) damage = 1;
  else if (generatedRandom > 35 && generatedRandom <= 70) damage = 2;
  else if (generatedRandom > 70) damage = 4;

  var targetchannel;
  if (target == 1) targetchannel = message.guild.channels.cache.find(channel => channel.id === config.channels.teamOne);
  else if (target == 2) targetchannel = message.guild.channels.cache.find(channel => channel.id === config.channels.teamTwo);
  else targetchannel = message.guild.channels.cache.find(channel => channel.id === config.channels.teamThree);
  pomMembers.sync().then(() => {
    pomMembers.findAll({
      where: {
        user: message.author.id,
      },
    }).then((result) => {
      if (result.length == 1) {
        var penalty = 1;
        if (result[0].class == "thief" && Math.floor(Math.random() * 10) + 1 > 8) penalty = 0;
        var coins = parseInt(result[0].coins);
        if (coins > 0) {
          coins -= penalty;
          pomTeams.sync().then(() => {
            var wordtarget;
            if (target == 1) {
              wordtarget = "one";
            } else if (target == 2) {
              wordtarget = "two";
            } else {
              wordtarget = "three";
            }
            pomTeams.findAll({
              where: {
                team: wordteam,
              },
            }).then((teamresult) => {
              if (timedifference(teamresult[0].bombcooldown, Date.now()) >= 20) {
                pomTeams.findAll({
                  where: {
                    team: wordtarget,
                  },
                }).then((targetresult) => {
                  if (targetresult[0].walls > 0) {
                    var addition = "";
                    console.log(damage);
                    if (result[0].class == "joker" && Math.floor(Math.random() * 10) + 1 > 9) {
                      damage += 1;
                      addition = " with a +1 damage bonus from your joker class.";
                    }
                    var newWalls = targetresult[0].walls - damage;
                    if (newWalls < 0) newWalls = 0;
                    var verb;
                    if (newWalls > 0) verb = "damaged";
                    else if (newWalls == 0) verb = `destroyed`;
                    if (newWalls < 0) newWalls = 0;
                    pomTeams.update({
                      walls: newWalls
                    }, {
                      where: {
                        team: wordtarget
                      }
                    }).then(() => {
                      pomMembers.update({
                        coins: coins,
                        bomb: result[0].bomb + 1
                      }, {
                        where: {
                          user: message.author.id
                        }
                      }).then(() => {
                        pomTeams.update({
                          bomb: teamresult[0].bomb + 1,
                          bombcooldown: Date.now()
                        }, {
                          where: {
                            team: wordteam
                          }
                        }, ).then(() => {
                          let plural = "coins";
                          if (penalty === 1) plural = "coin";
                          if (damage > 0) {
                            targetchannel.send(`:bomb: You have been bombed by the **${config.teamnames[teamresult[0].team]}**! Your walls are now at ${newWalls}. <@&${config.roles.pingrole}>`);
                          } else {
                            targetchannel.send(`:bomb: The **${config.teamnames[teamresult[0].team]}** attempted to bomb you, but it was a dud! It did no damage to your walls. <@&${config.roles.pingrole}>`);
                          }
                          return message.channel.send(`:bomb: You have ${verb} the **${config.teamnames[wordtarget]}**'s walls${addition}, doing a damage of ${damage}. Their walls are now at ${newWalls}. You lost ${penalty} ${plural} in the process and now have ${result[0].coins - 1}.`);
                        });
                      }).catch((error) => {
                        console.log('Update error: ' + error);
                      });
                    });
                  } else {
                    return message.channel.send('The walls are down! You have been saved your coin.');
                  }
                });
              } else {
                return message.channel.send(`:x: You must wait 20 seconds before your team can bomb again! Please wait another ${20 - timedifference(teamresult[0].bombcooldown, Date.now())} seconds.`);
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
  name: 'bomb',
  aliases: ['bomb'],
  description: 'Does a certain amount of damage (RNG-based) to whichever team\'s walls you target. Therefore, it is more efficient than the attack command at breaking down walls because it does far more damage to walls than attacks do. However, it does not earn you any points. The team must wait for 30 seconds before they can bomb again.',
  usage: ['bomb <team number>'],
};