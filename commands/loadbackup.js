const pomMembersBackup = require('../databaseFiles/pomMembersBackup');
const pomTeamsBackup = require('../databaseFiles/pomTeamsBackup');
const pomTeams = require('../databaseFiles/pomTeams');
const pomMembers = require('../databaseFiles/pomMembers');

module.exports.execute = async (client, message) => {
  if (message.member.hasPermission('ADMINISTRATOR')) {
    message.channel.send('**Warning!** This will revert the database to the last backup! Do you want to proceed? (yes/no)').then((warningmessage) => {
      const filter = m => m.author.id === message.author.id && (m.content.includes('yes') || m.content.includes('no') || m.content.includes('y') || m.content.includes('n'));
      const collector = warningmessage.channel.createMessageCollector(filter, {
        time: 15000
      });
      collector.on('collect', m => {
        if (m.content.includes('yes') || m.content.includes('y')) {
          (async () => {
            try {
              await pomMembers.drop();
              await pomTeams.drop();
              await pomTeamsBackup.sync();
              await pomMembersBackup.sync();
              await pomMembers.sync();
              await pomTeams.sync();

              var memberinsertresult = await pomMembersBackup.findAll({
                attributes: [
                  "user", "team", "coins", "points", "class", "classchange", "read", "tradein", "attack", "build", "bomb"
                ]
              });
              for (var i = 0; i < memberinsertresult.length; ++i) {
                await pomMembers.create({
                  user: memberinsertresult[i].user,
                  team: memberinsertresult[i].team,
                  coins: memberinsertresult[i].coins,
                  points: memberinsertresult[i].points,
                  class: memberinsertresult[i].class,
                  classchange: memberinsertresult[i].classchange,
                  read: memberinsertresult[i].read,
                  tradein: memberinsertresult[i].tradein,
                  attack: memberinsertresult[i].attack,
                  build: memberinsertresult[i].build,
                  bomb: memberinsertresult[i].bomb
                });
              }

              var teaminsertresult = await pomTeamsBackup.findAll({
                attributes: [
                  "team", "points", "members", "walls", "wallcooldown", "bombcooldown", "coinstash", "stonemasons", "thieves", "knights", "jokers", "read", "tradein", "attack", "build", "bomb", "teamone", "teamtwo", "teamthree"
                ]
              });
              for (var j = 0; j < teaminsertresult.length; ++j) {
                await pomTeams.create({
                  team: teaminsertresult[j].team,
                  points: teaminsertresult[j].points,
                  members: teaminsertresult[j].members,
                  walls: teaminsertresult[j].walls,
                  wallcooldown: teaminsertresult[j].wallcooldown,
                  bombcooldown: teaminsertresult[j].bombcooldown,
                  coinstash: teaminsertresult[j].coinstash,
                  stonemasons: teaminsertresult[j].stonemasons,
                  thieves: teaminsertresult[j].thieves,
                  knights: teaminsertresult[j].knights,
                  jokers: teaminsertresult[j].jokers,
                  read: teaminsertresult[j].read,
                  tradein: teaminsertresult[j].tradein,
                  attack: teaminsertresult[j].attack,
                  build: teaminsertresult[j].build,
                  bomb: teaminsertresult[j].bomb,
                  teamone: teaminsertresult[j].teamone,
                  teamtwo: teaminsertresult[j].teamtwo,
                  teamthree: teaminsertresult[j].teamthree
                });
              }

              collector.stop();
              return await message.channel.send(':white_check_mark: Backup has been loaded!');
            } catch (err) {
              console.log(err);
            }
          })();
        } else if (m.content.includes('no') || m.content.includes('n')) {
          collector.stop();
          return message.channel.send('Database has **not** been reset!');
        }
      });
    });
  } else {
    return await message.channel.send(':x: You must be an admin to load a backup!');
  }
};
module.exports.config = {
  name: 'loadbackup',
  aliases: ['loadbackup'],
  description: 'Overwrites the database and loads the latest backup.',
  usage: ['loadbackup'],
  adminonly: true,
};