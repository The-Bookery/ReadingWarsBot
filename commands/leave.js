const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomTeams = require('../databaseFiles/pomTeams');
const pomLeaves = require('../databaseFiles/pomLeaves');

function removeMember(client, message) {
  try {
    const guild = client.guilds.cache.get(message.guild.id);
    const member = guild.members.cache.get(message.author.id);

    const role1 = member.roles.cache.find(role => role.id === config.roles.teamone);
    const role2 = member.roles.cache.find(role => role.id === config.roles.teamtwo);
    const role3 = member.roles.cache.find(role => role.id === config.roles.teamthree);

    if (role1) member.roles.remove(role1);
    else if (role2) member.roles.remove(role2);
    else if (role3) member.roles.remove(role3);

    return `You have left the challenge and your points have been removed.`;
  } catch (err) {
    console.log(err);
    return `An error occured.`;
  }
}

module.exports.execute = async (client, message, args) => {
  if (args[0] && args[0].toLowerCase() == message.author.username.toLowerCase()) {
    try {
      pomMembers.sync().then(() => {
        pomLeaves.sync().then(() => {
          pomMembers.findAll({
            where: {
              user: message.author.id,
            }
          }).then((result) => {
            var wordteam;

            console.log(result);

            if (result[0].team == 1) {
              wordteam = "one";
            } else if (result[0].team == 2) {
              wordteam = "two";
            } else if (result[0].team == 3) {
              wordteam = "three";
            } else {
              return message.channel.send('Looks like you aren\'t in a team!');
            }

            pomLeaves.findAll(
              { where: { user: message.author.id } },
            ).then((leaveresult) => {
              console.log(leaveresult);
              if (leaveresult.length >= 1) {
                pomLeaves.destroy({
                  where: {
                    user: message.author.id
                  }
                });
              }
            });

            pomLeaves.create({
              user: message.author.id,
              time: Date.now(),
              oldteam: result[0].team,
            }).then(() => {
              pomTeams.findAll({
                where: {
                  team: wordteam,
                },
              }).then((teamresult) => {
                console.log(teamresult[0].exp - result[0].exp);
                pomTeams.update(
                  { exp: teamresult[0].exp - result[0].exp },
                  { where: { team: wordteam }}
                ).then(() => {
                  pomMembers.destroy({
                    where: {
                      user: message.author.id
                    }
                  }).then(() => {
                    return message.channel.send(removeMember(client, message, args));
                  }).catch((err) => {
                    console.error("Error! ", err);
                  });
                }).catch((err) => {
                  console.error("Error! ", err);
                });
              }).catch((err) => {
                console.error("Error! ", err);
              });
            });
          });
        });
      }).catch((err) => {
        console.error("Error! ", err);
      });
    } catch(err) {
      return message.channel.send("There was an error! Maybe you aren't part of the war?");
    }
  } else {
    return message.channel.send("Please confirm that you want to leave the war by adding your username after the command. Your whole team will suffer. Try again if you really want to leave.");
  }
};

module.exports.config = {
  name: 'leave',
  aliases: ['leavewar'],
  description: 'Leave the war and delete all your points. Use your username (without the tag, e.g. "leave zmontgo04") to confirm you want to leave.',
  usage: ['leave <your username>'],
};