const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomTeams = require('../databaseFiles/pomTeams');
const Sequelize = require('sequelize');

// call function with variables timestamp1 and timestamp2 in call
function timedifference(timestamp1, timestamp2) {
  // redefine the variables
  timestamp1 = new Date(parseInt(timestamp1));
  timestamp2 = new Date(parseInt(timestamp2));

  let difference = timestamp2.getTime() - timestamp1.getTime();

  difference = Math.floor(difference / 1000 / 60);

  return difference;
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateCooldown(wordtarget, wordteam) {
  if (wordtarget == "one") {
    pomTeams.update(
      { teamone: Date.now() },
      { where: { team: wordteam } }
    ).then(() => {
      return true;
    });
  } else if (wordtarget == "two") {
    pomTeams.update(
      { teamtwo: Date.now() },
      { where: { team: wordteam } }
    ).then(() => {
      return true;
    });
  } else {
    pomTeams.update(
      { teamthree: Date.now() },
      { where: { team: wordteam } }
    ).then(() => {
      return true;
    });
  }
  return false;
}

module.exports.execute = async (client, message, args) => {
  var team;

  if (message.channel.id === config.channels.teamOne) {
    team = 1;
  } else if (message.channel.id === config.channels.teamTwo) {
    team = 2;
  } else if (message.channel.id === config.channels.teamThree) {
    team = 3;
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

  var targetchannel;
  if (target == 1) targetchannel = message.guild.channels.cache.find(channel => channel.id === config.channels.teamOne);
  else if (target == 2) targetchannel = message.guild.channels.cache.find(channel => channel.id === config.channels.teamTwo);
  else targetchannel = message.guild.channels.cache.find(channel => channel.id === config.channels.teamThree);

  pomMembers.sync().then(() => {
    pomTeams.sync().then(() => {
    pomMembers.findAll({
      where: {
        user: message.author.id,
      },
    }).then((result) => {
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
          team: wordtarget,
        },
      }).then((targetresult) => {
        var wordteam;

        if (team == 1) {
          wordteam = "one";
        } else if (team == 2) {
          wordteam = "two";
        } else {
          wordteam = "three";
        }
        pomTeams.findAll({
          where: {
            team: wordteam
          }
        }).then((teamresult) => {
      if (result.length == 1) {
        var coins = parseInt(result[0].coins);

        if (coins > 0) {
          coins -= 1;
            var random = 25;
            var penalty = 1;

            if (result[0].class == "knight") random = 15;
            else if (result[0].class == "joker") random = 20;
            else if (result[0].class == "thief" && Math.floor(Math.random() * 10) + 1 > 8) penalty = 0;

            var stolen = randomInteger(500, 800);
            var generatedRandom = Math.floor(Math.random() * 100) + 1;

            if (generatedRandom > random) {
                if (targetresult[0].walls == 0) {
                  pomMembers.findAll({
                    attributes: [
                        "id", "user", "points", "team",
                        [Sequelize.literal('RANK () OVER ( ORDER BY points DESC )'), 'rank']
                      ],
                      raw: true,
                  }).then((rankedresult) => {
                    var i = 0;
                    var toremove = stolen;
                    if (toremove > targetresult[0].points) toremove = targetresult[0].points;

                    while (toremove > 0) {
                      if (rankedresult[i]) {
                        if (rankedresult[i].team == target) {
                          if (rankedresult[i].points >= stolen) {
                            pomMembers.update(
                              { points: rankedresult[i].points - stolen },
                              { where: { user: rankedresult[i].user } }
                            );
                            toremove = 0;
                          } else {
                            toremove -= rankedresult[i].points;
                            pomMembers.update(
                              { points: 0 },
                              { where: { user: rankedresult[i].user } }
                            );
                          }
                        }
                        i += 1;
                      } else {
                        break;
                      }
                    }
                    if (targetresult[0].points > 0) {
                        var timediff;
                        if (wordtarget == "one") {
                          timediff = timedifference(teamresult[0].teamone, Date.now());
                        } else if (wordtarget == "two") {
                          timediff = timedifference(teamresult[0].teamtwo, Date.now());
                          console.log(teamresult[0].teamtwo);
                        } else {
                          timediff = timedifference(teamresult[0].teamthree, Date.now());
                        }

                        console.log(timediff);

                        if (timediff >= 30) {
                          var newPoints = targetresult[0].points - stolen;
                          if (newPoints < 0) newPoints = 0;
                          var givenPoints = targetresult[0].points - newPoints;

                          pomTeams.update(
                            { points: newPoints },
                            { where: { team: wordtarget } }
                          ).then(() => {
                            pomTeams.update(
                              { points: teamresult[0].points + givenPoints,
                                attack: teamresult[0].attack + 1 },
                              { where: { team: wordteam }},
                            ).then(() => {
                              pomMembers.update(
                                { coins: result[0].coins - penalty,
                                  points: result[0].points + stolen,
                                  attack: result[0].attack + 1,
                                },
                                { where: { user: message.author.id } }
                              ).then(() => {
                                let plural = "coins";
                                if (result[0].coins - penalty === 1) plural = "coins";
                                var stole = `${plural}.`;
                                updateCooldown(wordtarget, wordteam);
                                if (penalty == 0) stole = `, losing no ${plural} because of your thief class!`;
                                console.log("Teams: " + config.teamnames[wordteam]);
                                return message.channel.send(`:crossed_swords: You attacked! Stealing ${givenPoints} points from the **${config.teamnames[wordtarget]}**. Their points are now at ${newPoints}, and yours are at ${teamresult[0].points + givenPoints}. You now have ${result[0].coins - penalty} ${stole}`);})
                                .then(() => {
                                  targetchannel.send(`:crossed_swords: You have been attacked by the **${config.teamnames[wordteam]}**! They stole ${givenPoints} points. You now have ${newPoints}. <@&${config.roles.pingrole}>`);
                                })
                                .catch((err) => {
                                  console.error("Error! ", err);
                                });
                              }).catch((error) => {
                                console.log('Update error: ' + error);
                              });
                            }).catch((err) => {
                              console.error("Error! ", err);
                            });
                        } else {
                          return message.channel.send(`:x: Looks like your team has attacked this team in the last 30 minutes! Wait another ${30 - timediff} minutes to let your troops rest!`);
                        }
                    } else {
                      return message.channel.send('Looks like this team has no points for you to take! You have kept your coin.');
                    }
                  });
                } else {
                  pomTeams.update(
                    { walls: targetresult[0].walls - 1 },
                    { where: { team: wordtarget } }
                  ).then(() => {
                    pomMembers.update(
                      { coins: result[0].coins - 1 },
                      { where: { user: message.author.id }}
                    ).then(() => {
                      var verb = `damaged`;
                      if (targetresult[0].walls - 1 == 0) verb = "destroyed";
                      targetchannel.send(`:crossed_swords: You have been attacked by the **${config.teamnames[wordteam]}**! Your walls blocked the attack and took one damage, and are now at ${targetresult[0].walls - 1}.`);
                      return message.channel.send(`:crossed_swords: You attack, but the enemy's walls were not breached! The walls were ${verb}, and now have a durability of ${targetresult[0].walls - 1}. You lost one coin in the attempt, and are now at ${result[0].coins - 1} coins.`);
                    })
                    .catch((err) => {
                      console.error("Error! ", err);
                    });
                  }).catch((err) => {
                    console.error("Error! ", err);
                  });
                }
            } else {
              pomMembers.update(
                { coins: result[0].coins - 1 },
                { where: { user: message.author.id }}
              ).then(() => {
                return message.channel.send(`:x: Your attack failed. You lost one coin in the attempt, and are now at ${result[0].coins - 1} coins.`);
              });
            }
        } else {
          return message.channel.send(`:x: You don't have enough coins for this! You only have ${result[0].coins} coins.`);
        }
      } else {
        return message.channel.send('Woah! Somehow you aren\'t in the challenge yet! Use `b-join` to get started!');
      }
    }).catch((err) => { // teamresult
      console.error("Error! ", err);
    });
    }); // Targetresult
    }).catch((err) => {
      console.error("Error! ", err);
    });
  }).catch((err) => { // Sync
    console.error("Error! ", err);
  });
  });
};

module.exports.config = {
  name: 'attack',
  module: 'Game',
  aliases: ['attack'],
  description: 'This will attempt an attack against the team you target. It can fail on occasion, making you lose the coin, and can be blocked by walls, which will also make you lose the coin. If it succeeds, it will take a random amount of coins from the opposing team\'s top players, and give it to you.',
  usage: ['attack <team number>'],
};
