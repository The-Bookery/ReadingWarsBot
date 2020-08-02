const config = require('../config.json');

function addRole(message) {
  try {
    const member = message.guild.members.cache.get(message.author.id);
    const pingrole = message.guild.roles.cache.find(role => role.id === config.roles.pingrole);

    if (message.member.roles.cache.find(role => role.id === config.roles.pingrole)) {
      member.roles.remove(pingrole);
      return message.channel.send(`:white_check_mark: You will no longer be pinged for important events!`);
    } else {
      message.member.roles.add(pingrole);
      return message.channel.send(`:white_check_mark: You will now be pinged for important events!`);
    }
  } catch (err) {
    console.log(err);
  }
}
module.exports.execute = async (client, message) => {
  addRole(message);
};
module.exports.config = {
  name: 'pingme',
  aliases: ['ping'],
  description: 'Pings you whenever an important event happens (like a team bombs or attacks you).',
  usage: ['pingme'],
};