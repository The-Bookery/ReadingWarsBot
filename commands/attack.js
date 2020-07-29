const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomTeams = require('../databaseFiles/pomTeams');
const Sequelize = require('sequelize');

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
    return await message.channel.send('Not the correct channel!');
  }

  if (args[0] != 1 && args[0] != 2 && args[0] != 3) {
    return await message.channel.send('Looks like you didn\'t target a team!');
  }

  var target = args[0];

  if (target == team) {
    return await message.channel.send('You can\'t target your own team!');
  }

  pomMembers.sync().then(() => {
    pomMembers.findAll({
      where: {
        user: message.author.id,
      },
    }).then((result) => {
      if (result.length == 1) {
        var coins = parseInt(result[0].coins);

        if (coins > 0) {
          coins -= 1;

          pomTeams.sync().then(() => {
            var wordteam;

            if (team == 1) {
              wordteam = "one";
            } else if (team == 2) {
              wordteam = "two";
            } else {
              wordteam = "three";
            }

            var wordtarget;

            if (target == 1) {
              wordtarget = "one";
            } else if (target == 2) {
              wordtarget = "two";
            } else {
              wordtarget = "three";
            }

            var random = 26;
            var penalty = 1;

            if (result[0].class == "knight") random = 16;
            else if (result[0].class == "joker") random = 21;
            else if (result[0].class == "thief" && Math.floor(Math.random() * 10) > 9) penalty = 0;

            var stolen = randomInteger(500, 750);
            var generatedRandom = Math.floor(Math.random() * 100);
            console.log(generatedRandom);


            if (generatedRandom > random) {
              pomTeams.findAll({
                where: {
                  team: wordtarget,
                },
              }).then((targetresult) => {
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
                      console.log(rankedresult);
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
                      pomTeams.findAll({
                        where: {
                          team: wordteam
                        }
                      }).then((teamresult) => {
                        var newExp = targetresult[0].points - stolen;
                        if (newExp < 0) newExp = 0;
                        var givenExp = targetresult[0].points - newExp;

                        pomTeams.update(
                          { points: newExp },
                          { where: { team: wordtarget } }
                        ).then(() => {
                          pomTeams.update(
                            { points: teamresult[0].points + givenExp,
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
                              var stole = "coins.";
                              if (penalty == 0) stole = ", losing no coins because of your thief class!";
                              return message.channel.send(`You attacked! Stealing ${givenExp} points from team ${wordtarget}. Their points is now at ${newExp}, and yours is at ${teamresult[0].points + givenExp}. You now have ${result[0].coins - penalty} ${stole}`);}).catch((err) => {
                                console.error("Error! ", err);
                              });
                            }).catch((error) => {
                              console.log('Update error: ' + error);
                            });
                          }).catch((err) => {
                            console.error("Error! ", err);
                          });
                        }).catch((err) => {
                          console.error("Error! ", err);
                        });

                    } else {
                      return message.channel.send('Looks like this team has no points for you to take! You have kept your coin.');
                    }
                  });
                } else {
                  pomTeams.update(
                    { walls: targetresult[0].walls - 1 },
                    { where: { team: wordtarget } }
                  ).then(() => {
                    pomTeams.update(
                      { coins: result[0].coins - 1 },
                      { where: { user: message.author.id }}
                    ).then(() => {
                      return message.channel.send(`You attack, but the enemy's walls were not breached! The walls sustained one damage, and are now at a durability of ${targetresult[0].walls - 1}. You lost one coin in the attempt, and are now at ${result[0].coins - 1} coins.`);
                    }).catch((err) => {
                      console.error("Error! ", err);
                    });
                  }).catch((err) => {
                    console.error("Error! ", err);
                  });
                }
              });
            } else {
              pomMembers.update(
                { coins: result[0].coins - 1 },
                { where: { user: message.author.id }}
              ).then(() => {
                return message.channel.send(`Your attack failed. You lost one coin in the attempt, and are now at ${result[0].coins - 1} coins.`);
              });
            }
          }).catch((err) => {
            console.error("Error! ", err);
          });
        } else {
          return message.channel.send(`You don't have enough coins for this! You only have ${result[0].coins} coins.`);
        }
      } else {
        return message.channel.send('Woah! Somehow you aren\'t in the challenge yet! Run `,join` to get started!');
      }
    }).catch((err) => {
      console.error("Error! ", err);
    });
  });
};

module.exports.config = {
  name: 'attack',
  aliases: [],
  description: 'Breaks down three walls at a time.',
  usage: ['bomb [team number]'],
};