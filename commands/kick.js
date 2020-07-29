const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');

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
};

module.exports.config = {
  name: 'kick',
  aliases: ['kick'],
  description: 'Kicks a user and removes their points from the team.',
  usage: ['kick [user ID]'],
};