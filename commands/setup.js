const pomTeams = require('../databaseFiles/pomTeams');

module.exports.execute = async (client, message) => {
  if (message.member.hasPermission('ADMINISTRATOR')) {
    pomTeams.sync().then(() => {
      pomTeams.findAll().then((result) => {
        if (result == 0) {
          pomTeams.create({
            team: "one",
            exp: 0,
            members: 0,
            walls: 0,
            stonemasons: 0,
            thieves: 0,
            knights: 0,
            jokers: 0,
            read: 0,
            tradein: 0,
            attack: 0,
            build: 0,
            bomb: 0,
          }).then(() => {
            pomTeams.create({
              team: "two",
              exp: 0,
              members: 0,
              walls: 0,
              stonemasons: 0,
              thieves: 0,
              knights: 0,
              jokers: 0,
              read: 0,
              tradein: 0,
              attack: 0,
              build: 0,
              bomb: 0,
            }).then(() => {
              pomTeams.create({
                team: "three",
                exp: 0,
                members: 0,
                walls: 0,
                stonemasons: 0,
                thieves: 0,
                knights: 0,
                jokers: 0,
                read: 0,
                tradein: 0,
                attack: 0,
                build: 0,
                bomb: 0,
              }).then(() => {
                return message.channel.send('Team database has been set up.');
              });
            });
          });
        } else {
          return message.channel.send('Looks like the team database has already been set up!');
        }
      });
    });
  } else {
    return message.channel.send('You must be an admin to set up the databases!');
  }
};

module.exports.config = {
  name: 'setup',
  aliases: [],
  description: 'Set up the important database before use. This is vital before you begin, otherwise it won\'t log any points for teams.',
  usage: ['setup'],
};