const pomMembers = require('../databaseFiles/pomMembers');
const pomBans = require('../databaseFiles/pomBans');
const pomTeams = require('../databaseFiles/pomTeams');
const pomLeaves = require('../databaseFiles/pomLeaves');
const config = require('../config.json');

module.exports.execute = async (client, message) => {
  if (message.member.hasPermission('ADMINISTRATOR')) {
    message.channel.send('**Warning!** THIS VERY OBVIOUSLY MESSES EVERYTHING UP! Do you want to proceed? (yes/no)').then((warningmessage) => {
      const filter = m => m.author.id === message.author.id
      && m.content.includes('yes')
      || m.content.includes('no')
      || m.content.includes('y')
      || m.content.includes('n');
      const collector = warningmessage.channel.createMessageCollector(filter, { time: 15000 });

      collector.on('collect', m => {
        if (m.content.includes('yes') || m.content.includes('y')) {
          pomTeams.sync().then(() => {
            pomMembers.sync().then(() => {
              pomTeams.findAll().then((result) => {
                var members = result[0].knights + result[0].thieves + result[0].jokers + result[0].stonemasons + result[1].knights + result[1].thieves + result[1].jokers + result[1].stonemasons + result[2].knights + result[2].thieves + result[2].jokers + result[2].stonemasons;

                pomMembers.findAll().then((memberresult) => {
                  const guild = client.guilds.cache.get(message.guild.id);

                  for(var i = 0; i < members; ++i){
                    var member = guild.members.cache.get(memberresult[i].user);

                    const role1 = member.roles.cache.find(role => role.id === config.roles.teamone);
                    const role2 = member.roles.cache.find(role => role.id === config.roles.teamtwo);
                    const role3 = member.roles.cache.find(role => role.id === config.roles.teamthree);

                    if (role1) member.roles.remove(role1);
                    else if (role2) member.roles.remove(role2);
                    else if (role3) member.roles.remove(role3);

                    console.log(`Removed member ${i} of ${members}.`);
                  }

                  pomMembers.drop()
                  .then(pomBans.drop()
                  .then(pomLeaves.drop()
                  .then(pomTeams.drop().then(
                    message.channel.send(`Custom channel database has been wiped!`)
                  ))));
                });
              });
            });
          });
        }
      });
    });
  } else {
    return message.channel.send("You do not have permissions to wipe the custom channel database!");
  }
};

module.exports.config = {
  name: 'drop',
  aliases: ['drop'],
  description: 'Wipes all tables and resets the entire game, removing everyone\'s roles as well. May take a second to finish.',
  usage: ['drop'],
  adminonly: true,
};