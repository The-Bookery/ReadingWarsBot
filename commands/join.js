const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomBans = require('../databaseFiles/pomBans');
const pomTeams = require('../databaseFiles/pomTeams');
const pomLeaves = require('../databaseFiles/pomLeaves');
var teamchoice = 1;
var wordteam = "one";
var gclass;
// call function with variables timestamp1 and timestamp2 in call
function timedifference(timestamp1, timestamp2) {
  // redefine the variables
  timestamp1 = new Date(parseInt(timestamp1));
  timestamp2 = new Date(parseInt(timestamp2));
  let difference = timestamp2.getTime() - timestamp1.getTime();
  difference = Math.floor(difference / 1000 / 60 / 60); // Hours `/ 1000 / 60 / 60`
  return difference;
}

function addRole(message) {
  try {
    var teamrole;
    if (teamchoice == 1) {
      teamrole = message.guild.roles.cache.find(role => role.id === config.roles.teamone);
    } else if (teamchoice == 2) {
      teamrole = message.guild.roles.cache.find(role => role.id === config.roles.teamtwo);
    } else {
      teamrole = message.guild.roles.cache.find(role => role.id === config.roles.teamthree);
    }
    message.member.roles.add(teamrole);
    message.channel.send(`:wave: You joined team ${teamchoice} as a ${gclass}!`);
  } catch (err) {
    console.log(err);
  }
}
module.exports.execute = async (client, message, args) => {
  if (args[0]) {
    gclass = args[0].toLowerCase();
    if (gclass !== "knight" && gclass !== "thief" && gclass !== "stonemason" && gclass !== "joker") {
      return await message.channel.send('Please choose a valid class name! (Use `b-help join` to see how to use this command.)');
    }
  } else {
    return await message.channel.send('Please choose a class! (Use `b-help join` to see how to use this command.)');
  }
  try {
    pomMembers.sync().then(() => {
      pomLeaves.sync().then(() => {
        pomBans.sync().then(() => {
          pomBans.findAll({
            where: {
              user: message.author.id,
            },
          }).then((bansresult) => {
            if (bansresult.length == 0) {
              pomMembers.findAll({
                where: {
                  user: message.author.id,
                },
              }).then((banresult) => {
                if (banresult.length == 0) {
                  pomLeaves.findAll({
                    where: {
                      user: message.author.id
                    }
                  }).then((leaveresult) => {
                    if (leaveresult.length >= 1 && timedifference(leaveresult[0].time, Date.now()) < 24) {
                      return message.channel.send(`:x: Looks like you left in the last day! Please wait an additional ${24 - timedifference(leaveresult[0].time, Date.now())} hours before joining again.`);
                    } else {
                      pomMembers.findAll().then((result) => {
                        if (result.length >= 1) {
                          var teamonecount = 0;
                          var teamtwocount = 0;
                          var teamthreecount = 0;
                          for (var i = 0; i < result.length; ++i) {
                            if (result[i].team == 1) teamonecount++;
                            else if (result[i].team == 2) {
                              teamtwocount++;
                            }
                          }
                          teamthreecount = result.length - (teamonecount + teamtwocount);
                          // Do math to determine where to put user
                          if (leaveresult.length == 0) {
                            if (teamonecount <= teamtwocount && teamonecount <= teamthreecount) {
                              teamchoice = 1;
                              wordteam = "one";
                            } else if (teamtwocount <= teamonecount && teamtwocount <= teamthreecount) {
                              teamchoice = 2;
                              wordteam = "two";
                            } else {
                              teamchoice = 3;
                              wordteam = "three";
                            }
                          } else {
                            if (leaveresult[0].oldteam == "one") {
                              teamchoice = 1;
                              wordteam = "one";
                            } else if (leaveresult[0].oldteam == "two") {
                              teamchoice = 2;
                              wordteam = "two";
                            } else {
                              teamchoice = 3;
                              wordteam = "three";
                            }
                          }
                        }
                        pomMembers.create({
                          user: message.author.id,
                          team: teamchoice,
                          coins: 0,
                          points: 0,
                          class: gclass,
                          classchange: Date.now(),
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
                              if (gclass == "knight") {
                                pomTeams.update({
                                  knights: teamresult[0].knights + 1
                                }, {
                                  where: {
                                    team: wordteam
                                  }
                                }).then(() => {
                                  addRole(message);
                                });
                              } else if (gclass == "thief") {
                                pomTeams.update({
                                  thieves: teamresult[0].thieves + 1
                                }, {
                                  where: {
                                    team: wordteam
                                  }
                                }).then(() => {
                                  addRole(message);
                                });
                              } else if (gclass == "stonemason") {
                                pomTeams.update({
                                  stonemasons: teamresult[0].stonemasons + 1
                                }, {
                                  where: {
                                    team: wordteam
                                  }
                                }).then(() => {
                                  addRole(message);
                                });
                              } else if (gclass == "joker") {
                                pomTeams.update({
                                  jokers: teamresult[0].jokers + 1
                                }, {
                                  where: {
                                    team: wordteam
                                  }
                                }).then(() => {
                                  addRole(message);
                                });
                              }
                            });
                          });
                        }).catch((err) => {
                          console.error('Team error: ', err);
                        });
                      });
                    }
                  });
                } else {
                  return message.channel.send('You are already in the competition!');
                }
              });
            } else {
              return message.channel.send(':x: You cannot join, as you have been banned from the competition.');
            }
          });
        });
      });
    });
  } catch (err) {
    return message.channel.send("There was an error adding that to the database! Are you sure you used commas around every value?");
  }
};
module.exports.config = {
  name: 'join',
  aliases: ['joinwar'],
  description: 'Join a random team the bot assigns with a class.',
  usage: ['join <knight | thief | stonemason | joker>'],
};