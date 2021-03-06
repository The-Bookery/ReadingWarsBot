const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomBans = require('../databaseFiles/pomBans');
const pomTeams = require('../databaseFiles/pomTeams');
const pomLeaves = require('../databaseFiles/pomLeaves');
const pomMembersBackup = require('../databaseFiles/pomMembersBackup');
const pomTeamsBackup = require('../databaseFiles/pomTeamsBackup');

// call function with variables timestamp1 and timestamp2 in call
function timesubtract(timestamp1) {
  // redefine the variables
  difference = new Date(parseInt(timestamp1));

  difference -= 1000 * 60 * 60 * 24;

  return difference;
}

function addRole(message, member) {
  try {
    var teamrole;
    if (teamchoice == 1) {
      teamrole = message.guild.roles.cache.find(role => role.id === config.roles.teamone);
    } else if (teamchoice == 2) {
      teamrole = message.guild.roles.cache.find(role => role.id === config.roles.teamtwo);
    } else {
      teamrole = message.guild.roles.cache.find(role => role.id === config.roles.teamthree);
    }

    if (gclass == "knight") {
      classrole = message.guild.roles.cache.find(role => role.id === config.roles.knight);
    } else if (gclass == "stonemason") {
      classrole = message.guild.roles.cache.find(role => role.id === config.roles.stonemason);
    } else if (gclass == "thief") {
      classrole = message.guild.roles.cache.find(role => role.id === config.roles.thief);
    } else {
      classrole = message.guild.roles.cache.find(role => role.id === config.roles.joker);
    }

    member.roles.add(classrole);
    member.roles.add(teamrole);

    message.channel.send(`${member.user.username} was put on team ${teamchoice} as a ${gclass}!`);
  } catch (err) {
    console.log(err);
  }
}
var teamchoice;
var gclass;
module.exports.execute = async (client, message, args) => {
  if (!args[0]) {
    return await message.channel.send("Please add a subcommand!");
  }
  if (!parseInt(args[0])) {
    return await message.channel.send('Looks like you didn\'t input a proper number.');
  }
  var member = message.guild.members.cache.get(args[0]);
  if (!member) return message.channel.send('Looks like your ID doesn\'t correspond to any member in this server!');
  if (message.member.hasPermission('ADMINISTRATOR')) {
    if (args[1]) {
      teamchoice = args[1].toLowerCase();
      if (teamchoice != 1 && teamchoice != 2 && teamchoice != 3 && teamchoice !== 4) {
        return await message.channel.send('Please choose a valid team number!');
      }
    } else {
      return await message.channel.send('Please choose a valid class!');
    }
    if (args[2]) {
      gclass = args[2].toLowerCase();
      if (gclass !== "knight" && gclass !== "thief" && gclass !== "stonemason" && gclass !== "joker") {
        return await message.channel.send('Please choose a valid class name!');
      }
    } else {
      return await message.channel.send('Please choose a class!');
    }
    try {
      pomMembers.sync().then(() => {
        pomLeaves.sync().then(() => {
          pomBans.sync().then(() => {
            pomBans.findAll({
              where: {
                user: args[0],
              },
            }).then((bansresult) => {
              if (bansresult.length == 0) {
                pomMembers.findAll({
                  where: {
                    user: args[0],
                  },
                }).then((result) => {
                  if (result.length == 0) {
                    // Do math to determine where to put user
                    if (teamchoice == 1) {
                      wordteam = "one";
                    } else if (teamchoice == 2) {
                      wordteam = "two";
                    } else {
                      wordteam = "three";
                    }
                    pomMembers.create({
                      user: args[0],
                      team: teamchoice,
                      coins: 0,
                      points: 0,
                      class: gclass,
                      classchange: timesubtract(Date.now()),
                      read: 0,
                      tradein: 0,
                      attack: 0,
                      build: 0,
                      bomb: 0
                    }).then(() => {
                      pomTeams.sync().then(() => {
                        pomTeams.findAll({
                          where: {
                            team: wordteam
                          }
                        }).then((teamresult) => {
                          (async () => {
                            // Quietly add to backup database
                            await pomTeamsBackup.sync();
                            await pomMembersBackup.sync();
                            await pomMembersBackup.create({
                              user: args[0],
                              team: teamchoice,
                              coins: 0,
                              points: 0,
                              class: gclass,
                              classchange: timesubtract(Date.now()),
                              read: 0,
                              tradein: 0,
                              attack: 0,
                              build: 0,
                              bomb: 0
                            });

                            if (gclass == "knight") {
                              await pomTeamsBackup.update({
                                knights: teamresult[0].knights + 1
                              }, {
                                where: {
                                  team: wordteam
                                }
                              });
                            } else if (gclass == "thief") {
                              await pomTeams.update({
                                thieves: teamresult[0].thieves + 1
                              }, {
                                where: {
                                  team: wordteam
                                }
                              });
                            } else if (gclass == "stonemason") {
                              await pomTeams.update({
                                stonemasons: teamresult[0].stonemasons + 1
                              }, {
                                where: {
                                  team: wordteam
                                }
                              });
                            } else if (gclass == "joker") {
                              await pomTeams.update({
                                jokers: teamresult[0].jokers + 1
                              }, {
                                where: {
                                  team: wordteam
                                }
                              });
                            }
                          })();

                          if (gclass == "knight") {
                            pomTeams.update({
                              knights: teamresult[0].knights + 1
                            }, {
                              where: {
                                team: wordteam
                              }
                            }).then(() => {
                              addRole(message, member);
                            });
                          } else if (gclass == "thief") {
                            pomTeams.update({
                              thieves: teamresult[0].thieves + 1
                            }, {
                              where: {
                                team: wordteam
                              }
                            }).then(() => {
                              addRole(message, member);
                            });
                          } else if (gclass == "stonemason") {
                            pomTeams.update({
                              stonemasons: teamresult[0].stonemasons + 1
                            }, {
                              where: {
                                team: wordteam
                              }
                            }).then(() => {
                              addRole(message, member);
                            });
                          } else if (gclass == "joker") {
                            pomTeams.update({
                              jokers: teamresult[0].jokers + 1
                            }, {
                              where: {
                                team: wordteam
                              }
                            }).then(() => {
                              addRole(message, member);
                            });
                          }
                        });
                      });
                    }).catch((err) => {
                      console.error('Team error: ', err);
                    });
                  } else {
                    console.log(result);
                    return message.channel.send('That user is already in the competition!');
                  }
                });
              } else {
                return message.channel.send('This user has been banned from the competition. Please unban them to add them!');
              }
            });
          });
        });
      });
    } catch (err) {
      return message.channel.send("There was an error adding that to the database! Are you sure you used commas around every value?");
    }
  } else {
    return await message.channel.send('You are lacking the admin priveledge to run this command.');
  }
};
module.exports.config = {
  name: 'place',
  module: 'Admin',
  aliases: ['place'],
  description: 'Manually put a member on a specific team.',
  usage: ['place <user ID> <team number> <class>'],
  adminonly: true,
};