const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomBans = require('../databaseFiles/pomBans');
const pomTeams = require('../databaseFiles/pomTeams');
const pomMembersBackup = require('../databaseFiles/pomMembersBackup');
const pomTeamsBackup = require('../databaseFiles/pomTeamsBackup');

function removeMember(client, message, args) {
  try {
    const guild = client.guilds.cache.get(message.guild.id);
    const member = guild.members.cache.get(args[0]);
    const role1 = member.roles.cache.find(role => role.id === config.roles.teamone);
    const role2 = member.roles.cache.find(role => role.id === config.roles.teamtwo);
    const role3 = member.roles.cache.find(role => role.id === config.roles.teamthree);

    const knightrole = member.roles.cache.find(role => role.id === config.roles.knight);
    const stonemasonrole = member.roles.cache.find(role => role.id === config.roles.stonemason);
    const thiefrole = member.roles.cache.find(role => role.id === config.roles.thief);
    const jokerrole = member.roles.cache.find(role => role.id === config.roles.joker);

    if (role1) member.roles.remove(role1);
    else if (role2) member.roles.remove(role2);
    else if (role3) member.roles.remove(role3);

    if (knightrole) member.roles.remove(knightrole);
    else if (stonemasonrole) member.roles.remove(stonemasonrole);
    else if (thiefrole) member.roles.remove(thiefrole);
    else if (jokerrole) member.roles.remove(jokerrole);

    return `User has been banned and will not be able to join.`;
  } catch (err) {
    console.log(err);
    return `An error occured.`;
  }
}
module.exports.execute = async (client, message, args) => {
  if (!args[0]) {
    return await message.channel.send("Please add a subcommand!");
  }
  if (message.member.hasPermission('ADMINISTRATOR')) {
    try {
      pomBans.sync().then(() => {
        pomMembers.sync().then(() => {
          pomTeams.sync().then(() => {
            pomBans.create({
              user: args[0]
            }).then(() => {
              pomMembers.findAll({
                where: {
                  user: args[0],
                }
              }).then((result) => {
                if (result.length > 0) {
                  var wordteam;
                  if (result[0].team == 1) {
                    wordteam = "one";
                  } else if (result[0].team == 2) {
                    wordteam = "two";
                  } else if (result[0].team == 3) {
                    wordteam = "three";
                  } else {
                    return message.channel.send('Looks like you aren\'t in a team!');
                  }
                  pomTeams.findAll({
                    where: {
                      team: wordteam,
                    },
                  }).then((teamresult) => {
                    pomTeams.update({
                      points: teamresult[0].points - result[0].points,
                      read: teamresult[0].read - result[0].read,
                      tradein: teamresult[0].tradein - result[0].tradein,
                      attack: teamresult[0].attack - result[0].attack,
                      build: teamresult[0].build - result[0].build,
                      bomb: teamresult[0].bomb - result[0].bomb
                    }, {
                      where: {
                        team: wordteam,
                      }
                    }).then(() => {
                      (async () => {
                        // Quietly remove from backup database
                        await pomTeamsBackup.sync();
                        await pomMembersBackup.sync();
                        await pomMembersBackup.destroy({
                          where: {
                            user: message.author.id,
                          }
                        });
    
                        pomTeamsBackup.update({
                          points: teamresult[0].points - result[0].points,
                          read: teamresult[0].read - result[0].read,
                          tradein: teamresult[0].tradein - result[0].tradein,
                          attack: teamresult[0].attack - result[0].attack,
                          build: teamresult[0].build - result[0].build,
                          bomb: teamresult[0].bomb - result[0].bomb
                        });
                      })();
                      
                      var gclass = result[0].class;
                      if (gclass == "knight") {
                        pomTeams.update({
                          knights: teamresult[0].knights - 1
                        }, {
                          where: {
                            team: wordteam
                          }
                        });
                      } else if (gclass == "thief") {
                        pomTeams.update({
                          thieves: teamresult[0].thieves - 1
                        }, {
                          where: {
                            team: wordteam
                          }
                        });
                      } else if (gclass == "stonemason") {
                        pomTeams.update({
                          stonemasons: teamresult[0].stonemasons - 1
                        }, {
                          where: {
                            team: wordteam
                          }
                        });
                      } else if (gclass == "joker") {
                        pomTeams.update({
                          jokers: teamresult[0].jokers - 1
                        }, {
                          where: {
                            team: wordteam
                          }
                        });
                      }
                    });
                  });
                }
                pomMembers.destroy({
                  where: {
                    user: args[0]
                  }
                }).then(() => {
                  return message.channel.send(removeMember(client, message, args));
                });
              });
            });
          });
        });
      });
    } catch (err) {
      console.log(err);
    }
  } else {
    return message.channel.send('You do not have permission to ban a user from the challenge!');
  }
};
module.exports.config = {
  name: 'ban',
  aliases: ['banuser'],
  description: 'Removes a person from the competition and blocks them from joining again.',
  usage: ['ban [user ID]'],
  adminonly: true,
};