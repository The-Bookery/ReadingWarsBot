const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomBans = require('../databaseFiles/pomBans');
const pomTeams = require('../databaseFiles/pomTeams');

function removeMember(client, message, args) {
  try {
    const guild = client.guilds.cache.get(message.guild.id);
    const member = guild.members.cache.get(args[0]);

    const role1 = member.roles.cache.find(role => role.id === config.roles.teamone);
    const role2 = member.roles.cache.find(role => role.id === config.roles.teamtwo);
    const role3 = member.roles.cache.find(role => role.id === config.roles.teamthree);

    if (role1) member.roles.remove(role1);
    else if (role2) member.roles.remove(role2);
    else if (role3) member.roles.remove(role3);

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
            })
            .then(() => {
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
                    pomTeams.update(
                      {
                        points: teamresult[0].points - result[0].points,
                        read: teamresult[0].read - result[0].read,
                        tradein: teamresult[0].tradein - result[0].tradein,
                        attack: teamresult[0].attack - result[0].attack,
                        build: teamresult[0].build - result[0].build,
                        bomb: teamresult[0].bomb - result[0].bomb
                      },
                      { where: { team: wordteam, }}
                    ).then(() => {
                      var gclass = result[0].class;
                      if (gclass == "knight") {
                        pomTeams.update(
                          { knights: teamresult[0].knights - 1 },
                          { where: { team: wordteam } }
                        );
                      } else if (gclass == "thief") {
                        pomTeams.update(
                          { thieves: teamresult[0].thieves - 1 },
                          { where: { team: wordteam } }
                        );
                      } else if (gclass == "stonemason") {
                        pomTeams.update(
                          { stonemasons: teamresult[0].stonemasons - 1 },
                          { where: { team: wordteam } }
                        );
                      } else if (gclass == "joker") {
                        pomTeams.update(
                          { jokers: teamresult[0].jokers - 1 },
                          { where: { team: wordteam } }
                        );
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
};