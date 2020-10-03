const config = require('../config.json');
module.exports.execute = async (client, message) => {
  if (message.channel.id === config.channels.teamOne) {
    return await message.channel.send(`Hey there, member of the **${config.teamnames["one"]}**!`);
  } else if (message.channel.id === config.channels.teamTwo) {
    return await message.channel.send(`Hey there, member of the **${config.teamnames["two"]}**!`);
  } else if (message.channel.id === config.channels.teamThree) {
    return await message.channel.send(`Hey there, member of the **${config.teamnames["three"]}**!`);
  } else {
    return await message.channel.send('Not the correct channel! Please go to your team channel.');
  }
};
module.exports.config = {
  name: 'hello',
  module: 'General',
  aliases: ['hello'],
  description: 'Says hello. Use to test if bot is online.',
  usage: ['hello'],
};