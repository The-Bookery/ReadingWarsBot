const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomBans = require('../databaseFiles/pomBans');
const pomTeams = require('../databaseFiles/pomTeams');
const pomLeaves = require('../databaseFiles/pomLeaves');

function addRole(message, member) {
  try {
    var teamrole;
    if (teamchoice == 1) {
      teamrole = message.guild.roles.cache.find(role => role.id === config.roles.teamone);
    }
    else if (teamchoice == 2) {
      teamrole = message.guild.roles.cache.find(role => role.id === config.roles.teamtwo);
    }
    else {
      teamrole = message.guild.roles.cache.find(role => role.id === config.roles.teamthree);
    }
    member.roles.add(teamrole);
    message.channel
      .send(
        `${member.user.username} was put on team ${teamchoice} as a ${gclass}!`
      );
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

  if(!parseInt(args[0])) {
    return await message.channel.send('Looks like you didn\'t input a proper number.');
  }

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
                    var member = message.guild.members.cache.get(args[0]);
                    if (!member) return message.channel.send('Looks like your ID doesn\'t correspond to any member in this server!');

                    // Do math to determine where to put user
                    if (teamchoice == 1) {
                      wordteam = "one";
                    }
                    else if (teamchoice == 2) {
                      wordteam = "two";
                    }
                    else {
                      wordteam = "three";
                    }

                    pomMembers.create({
                      user: args[0],
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
                    })
                    .then(() => {
                      pomTeams.sync().then(() => {
                        pomTeams.findAll({
                          where: {
                            team: wordteam
                          }
                        }).then((teamresult) => {
                          if (gclass == "knight") {
                            pomTeams.update(
                              { knights: teamresult[0].knights + 1 },
                              { where: { team: wordteam } }
                            ).then(() => {
                              addRole(message, member);
                            });
                          } else if (gclass == "thief") {
                            pomTeams.update(
                              { thieves: teamresult[0].thieves + 1 },
                              { where: { team: wordteam } }
                            ).then(() => {
                              addRole(message, member);
                            });
                          } else if (gclass == "stonemason") {
                            pomTeams.update(
                              { stonemasons: teamresult[0].stonemasons + 1 },
                              { where: { team: wordteam } }
                            ).then(() => {
                              addRole(message, member);
                            });
                          } else if (gclass == "joker") {
                            pomTeams.update(
                              { jokers: teamresult[0].jokers + 1 },
                              { where: { team: wordteam } }
                            ).then(() => {
                              addRole(message, member);
                            });
                          }
                        });
                      });
                    })
                    .catch((err) => {
                      console.error('Team error: ', err);
                    });
                  } else {
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
    }
    catch(err) {
      return message.channel.send("There was an error adding that to the database! Are you sure you used commas around every value?");
    }
  } else {
    return await message.channel.send('You are lacking the admin priveledge to run this command.');
  }
};

module.exports.config = {
  name: 'place',
  aliases: ['place'],
  description: 'Manually put a member on a specific team.',
  usage: ['place <user ID> <team #> <class>'],
};