const pomStats = require('../databaseFiles/pomStats');

module.exports.execute = async (client, message) => {
  if (message.member.hasPermission('ADMINISTRATOR')) {
    pomStats.sync().then(() => {
      pomStats.findAll().then((result) => {
        if (result == 0) {
          pomStats.create({
            team: "one",
            exp: 0,
            members: 0,
            walls: 0,
            defending: 0
          }).then(() => {
            pomStats.create({
              team: "two",
              exp: 0,
              members: 0,
              walls: 0,
              defending: 0
            }).then(() => {
              pomStats.create({
                team: "three",
                exp: 0,
                members: 0,
                walls: 0,
                defending: 0
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