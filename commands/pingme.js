const config = require('../config.json');

function addRole(message) {
  try {
    pingrole = message.guild.roles.cache.find(role => role.id === config.roles.pingrole);

    message.member.roles.add(pingrole);
    message.channel
      .send(
        `:white_check_mark: You will now be pinged for important events!`
      );
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