const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomBans = require('../databaseFiles/pomBans');

module.exports.execute = async (client, message, args) => {
  if (args[0]) {
    var gclass = args[0].toLowerCase();
    if (gclass !== "knight" && gclass !== "spy" && gclass !== "builder" && gclass !== "joker") {
      return await message.channel.send('Please choose a valid class name! (Use `,help join` to see how to use this command.)');
    }
  } else {
    return await message.channel.send('Please choose a class! (Use `,help join` to see how to use this command.)');
  }

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
                    points: 0,
                    exp: 0,
                    class: gclass,
                    classchange: Date.now(),
                    read: 0,
                    attack: 0,
                    build: 0,
                    bomb: 0,
                    defend: 0,
                    spy: 0
                  })
                  .then(() => {
                    try {
                      var teamrole;
                      if (teamchoice == 1) {
                        teamrole = message.guild.roles.find(role => role.id === config.roles.teamone);
                      }
                      else if (teamchoice == 2) {
                        teamrole = message.guild.roles.find(role => role.id === config.roles.teamtwo);
                      }
                      else {
                        teamrole = message.guild.roles.find(role => role.id === config.roles.teamthree);
                      }
                      message.member.addRole(teamrole);
                      message.channel
                        .send(
                          `You joined team ${teamchoice} as a ${gclass}!`
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
};

module.exports.config = {
  name: 'join',
  aliases: ['joinwar'],
  description: 'Join a random team the bot assigns with a class.',
  usage: ['join <knight | spy | builder | joker>'],
};