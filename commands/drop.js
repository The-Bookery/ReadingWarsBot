const pomMembers = require('../databaseFiles/pomMembers');
const pomBans = require('../databaseFiles/pomBans');
const pomStats = require('../databaseFiles/pomStats');

module.exports.execute = async (client, message) => {
  if (message.member.hasPermission('ADMINISTRATOR')) {
    pomMembers.drop()
    .then(pomBans.drop()
    .then(pomStats.drop().then(
      message.channel.send(`Custom channel database has been wiped!`)
    )));
  } else {
    return message.channel.send("You do not have permissions to wipe the custom channel database!");
  }
};

module.exports.config = {
  name: 'drop',
  aliases: [],
  description: 'Drops all tables.',
  usage: ['drop'],
};