const pomMembers = require('../databaseFiles/pomMembers');
const pomBans = require('../databaseFiles/pomBans');
const pomTeams = require('../databaseFiles/pomTeams');
const pomLeaves = require('../databaseFiles/pomLeaves');

module.exports.execute = async (client, message) => {
  if (message.member.hasPermission('ADMINISTRATOR')) {
    pomMembers.drop()
    .then(pomBans.drop()
    .then(pomLeaves.drop()
    .then(pomTeams.drop().then(
      message.channel.send(`Custom channel database has been wiped!`)
    ))));
  } else {
    return message.channel.send("You do not have permissions to wipe the custom channel database!");
  }
};

module.exports.config = {
  name: 'drop',
  aliases: ['drop'],
  description: 'Wipes all tables and resets the entire game. (Does not remove roles)',
  usage: ['drop'],
};