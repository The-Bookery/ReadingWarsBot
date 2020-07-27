const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomStats = require('../databaseFiles/pomStats');

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
        var points = parseInt(result[0].points);

        if (points > 0) {
          points -= 1;

          pomStats.sync().then(() => {
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

            if (Math.floor(Math.random() * 100) > 49) {
              pomStats.findAll({
                where: {
                  team: wordtarget,
                },
              }).then((targetresult) => {
                if (targetresult[0].walls == 0) {
                  pomStats.findAll({
                    where: {
                      team: wordteam
                    }
                  }).then((teamresult) => {
                    var newExp = targetresult[0].exp - 200;
                    if (newExp < 0) newExp = 0;
                    var givenExp = targetresult[0].exp - newExp;

                    pomStats.update(
                      { exp: newExp },
                      { where: { team: wordtarget } }
                    ).then(() => {
                      pomStats.update(
                        { exp: teamresult[0].exp + givenExp },
                        { where: { team: wordteam }},
                      ).then(() => {
                        pomMembers.update(
                          { points: points},
                          { where: { user: message.author.id } }
                        ).then(() => {
                          pomStats.update(
                            { points: result[0].points - 1 },
                            { where: { user: message.author.id }}
                          ).then(() => {
                            pomMembers.update(
                              { attack: result[0].attack + 1 },
                              { where: { user: message.author.id }}
                            ).then(() => {return message.channel.send(`You attacked! Stealing ${givenExp} exp from team ${wordtarget}. Their exp is now at ${newExp}, and yours is at ${teamresult[0].exp + givenExp}. You now have ${result[0].points} points.`);}).catch((err) => {
                              console.error("Error! ", err);
                            });
                          }).catch((err) => {
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
                  }).catch((err) => {
                    console.error("Error! ", err);
                  });
                } else {
                  pomStats.update(
                    { walls: targetresult[0].walls - 1 },
                    { where: { team: wordtarget } }
                  ).then(() => {
                    pomStats.update(
                      { points: result[0].points - 1 },
                      { where: { user: message.author.id }}
                    ).then(() => {
                      return message.channel.send(`You attack, but the enemy's walls were not breached! The walls sustained one damage, and are now at a durability of ${targetresult[0].walls - 1}. You lost one point in the attempt, and are now at ${result[0].points - 1} points.`);
                    }).catch((err) => {
                      console.error("Error! ", err);
                    });
                  }).catch((err) => {
                    console.error("Error! ", err);
                  });
                }
              }).catch((err) => {
                console.error("Error! ", err);
              });
            } else {
              pomStats.update(
                { points: result[0].points - 1 },
                { where: { user: message.author.id }}
              ).then(() => {
                return message.channel.send(`Your attack failed. You lost one point in the attempt, and are now at ${result[0].points - 1} points.`);
              });
            }
          });
        } else {
          return message.channel.send(`You don't have enough points for this! You only have ${result[0].points} points.`);
        }
      } else {
        return message.channel.send('Woah! Somehow you aren\'t in the challenge yet! Run `,join` to get started!');
      }
    }).catch((err) => {
      console.error("Error! ", err);
    });
  }).catch((err) => {
    console.error("Error! ", err);
  });
};

module.exports.config = {
  name: 'attack',
  aliases: [],
  description: 'Breaks down three walls at a time.',
  usage: ['bomb [team number]'],
};