const Discord = require('discord.js');
const pomTeams = require('../databaseFiles/pomTeams');
const Sequelize = require('sequelize');
module.exports.execute = async (client, message) => {
  try {
    pomTeams.sync().then(() => {
      pomTeams.findAll({
        attributes: ["id", "team", "points", [Sequelize.literal('RANK () OVER ( ORDER BY points DESC )'), 'rank']],
        raw: true,
      }).then((result) => {
        if (result.length >= 1) {
          let helpMessage = new Discord.MessageEmbed().setColor('#750384').setTitle('Team Leaderboard').setDescription(`See the ranks of teams!`);
          for (var i = 0; i < result.length; ++i) {
            helpMessage.addField(`**Team ${result[i].team[0].toUpperCase() + result[i].team.slice(1)}**`, `\`\`\`${result[i].points}\`\`\``);
            if (i == 9) break;
          }
          try {
            return message.channel.send(helpMessage);
          } catch (err) {
            console.log(err);
          }
        } else {
          return message.channel.send('I couldn\'t find that user! Please try again.');
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
};
module.exports.config = {
  name: 'leaderboard',
  aliases: ['lb', 'top'],
  description: 'See the top teams and their points.',
  usage: ['leaderboard'],
};