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
    pomBans.sync().then(() => {
      pomBans.create({
        user: args[0]
      })
      .then(() => {
        pomMembers.sync().then(() => {
          pomMembers.destroy({
            where: {
              user: args[0]
            }
          }).then(() => {
            return message.channel.send(removeMember(client, message, args));
          });
        })
      .catch((err) => {
        console.error('Ban error: ', err);
      });
    });
  });
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