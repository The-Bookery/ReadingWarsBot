const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomBans = require('../databaseFiles/pomBans');

function removeMember(client, message, args) {
  try {
    const guild = guild.guilds.cache.get(message.guild.id);
    const member = guild.members.get(args[0]);

    const role1 = member.roles.find(role => role.id === config.roles.teamone);
    const role2 = member.roles.find(role => role.id === config.roles.teamtwo);
    const role3 = member.roles.find(role => role.id === config.roles.teamthree);

    if (role1) member.removeRole(role1);
    else if (role2) member.removeRole(role2);
    else if (role3) member.removeRole(role3);

    return `User has been removed from challenge.`;
  } catch (err) {
    console.log(err);
    return `An error occured.`;
  }
}

module.exports.execute = async (client, message, args) => {
  if (!args[0]) {
    return await message.channel.send("Please add a subcommand!");
  }

  switch (args[0].toLowerCase()) {
    case 'kick':
      args.shift();

      if (message.member.hasPermission('ADMINISTRATOR')) {
        pomMembers.sync().then(() =>
          pomMembers.destroy({
            where: {
              user: args[0]
            }
          })
          .then(() => {
            return message.channel.send(removeMember(client, message, args));
          })
          .catch((err) => {
            console.error('Remove user error: ', err);
          })
        );
      } else {
        return message.channel.send("You do not have permissions to kick a user from the challenge!");
      }
    break;
    case 'ban':
      args.shift();

      if (message.member.hasPermission('ADMINISTRATOR')) {
        pomBans.sync().then(() => {
          pomBans.create({
            user: args[0]
          })
          .then(() => {
            pomMembers.sync().then(() =>
            pomMembers.destroy({
              where: {
                user: args[0]
              }
            }).then(() => {
              return message.channel.send(removeMember(client, message, args));
            }));
          })
          .catch((err) => {
            console.error('Ban error: ', err);
          });
        });
      } else {
        return message.channel.send('You do not have permission to ban a user from the challenge!');
      }
    break;
    case 'unban':
      args.shift();

      if (message.member.hasPermission('ADMINISTRATOR')) {
        pomBans.sync().then(() => {
          pomBans.destroy({
            where: {
              user: args[0]
            }
          }).then(() => {
            return message.channel.send('User has been unbanned and can rejoin at their choosing.');
          });
        });
      } else {
        return message.channel.send('You do not have permission to unban a user from the challenge!');
      }
    break;
    case 'hello':
      if (message.channel.id === config.channels.teamOne) {
        return await message.channel.send('Hey there, member of team one!');
      } else if (message.channel.id === config.channels.teamTwo) {
        return await message.channel.send('Hey there, member of team two!');
      } else if (message.channel.id === config.channels.teamThree) {
        return await message.channel.send('Hey there, member of team three!');
      } else {
        return await message.channel.send('Not the correct channel!');
      }
    case 'read':
      if (message.channel.id === config.channels.teamOne) {
        pomMembers.sync().then(() => {
          pomBans.findAll({
            where: {
              user: message.author.id,
            },
          }).then((result) => {
            if (result.length == 1) {
              pomMembers.update(
                { coins:  result.coins + 1,
                  stats: result.stats + 5},
                { where: { user: user.id } }
              ).then(() => {
                return message.channel.send('You now have one coin to use! You also got a bonus of 5 coins for your team.');
              }).catch((error) => {
                console.log('Update error: ' + error);
              });
            } else {
              return message.channel.send('Woah! Somehow you aren\'t in the challenge yet! Run `,join` to get started!');
            }
          });
        });
      } else if (message.channel.id === config.channels.teamTwo) {
        return await message.channel.send('Hey there, member of team two!');
      } else if (message.channel.id === config.channels.teamThree) {
        return await message.channel.send('Hey there, member of team three!');
      } else {
        return await message.channel.send('Not the correct channel!');
      }
    break;
    case 'join':
      var teamchoice = 1;

      try {
        pomMembers.sync().then(() =>
          pomMembers.findAll().then((result) => {
            if (result.length >= 1) {
              var teamonecount = 0;
              var teamtwocount = 0;
              var teamthreecount = 0;
              for(var i = 0; i < result.length; ++i){
                if(result[i].team == 1)
                  teamonecount++;
                else if(result[i].team == 2) {
                  teamtwocount++;
                }
              }

              teamthreecount = result.length - (teamonecount + teamtwocount);

              // Do math to determine where to put user
              if (teamonecount <= teamtwocount && teamonecount <= teamthreecount) {
                teamchoice = 1;
              }
              else if (teamtwocount <= teamonecount && teamtwocount <= teamthreecount) {
                teamchoice = 2;
              }
              else {
                teamchoice = 3;
              }
            }
          }).then(
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
                  }).then((result) => {
                    if (result.length == 0) {
                      pomMembers.create({
                        user: message.author.id,
                        team: teamchoice,
                        coins: 0,
                        stats: 0
                      })
                      .then(() => {
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
                          message.member.addRole(teamrole);
                          message.channel
                            .send(
                              `You joined team ${teamchoice}!`
                            );
                        } catch (err) {
                          console.log(err);
                        }
                      })
                      .catch((err) => {
                        console.error('Team error: ', err);
                      });
                    } else {
                      return message.channel.send('You are already in the competition!');
                    }
                  });
                } else {
                  return message.channel.send('You have been banned from the competition.');
                }
              });
            })
          ));
      } catch(err) {
        return message.channel.send("There was an error adding that to the database! Are you sure you used commas around every value?");
      }
    break;
  }
};

module.exports.config = {
  name: 'pom',
  aliases: ['pom'],
  module: 'Utility',
  description: 'Says hello. Use to test if bot is online.',
  usage: ['hello'],
};