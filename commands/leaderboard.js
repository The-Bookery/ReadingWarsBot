const Discord = require('discord.js');
const pomTeams = require('../databaseFiles/pomTeams');
const Sequelize = require('sequelize');
const config = require('../config.json');

module.exports.execute = async (client, message, args) => {
  try {
    var focus;

  if (args[0]) {
    if (args[0].toLowerCase() == "humans" && message.member.hasPermission('ADMINISTRATOR')) {
      focus = "humans";
    } else {
      focus = "teams";
    }
  } else {
    focus = "teams";
  }

  try {
    if (focus == "humans") {
      pomMembers.sync().then(() => {
        pomMembers.findAll({
          attributes: [
              "id", "user", "points", "team",
              [Sequelize.literal('RANK () OVER ( ORDER BY points DESC )'), 'rank']
            ],
            raw: true,
        }).then((result) => {
            if (result.length >= 1) {
              const guild = client.guilds.cache.get(message.guild.id);

              let helpMessage = new Discord.MessageEmbed()
                .setColor('#750384')
                .setTitle('The Leaderboard')
                .setDescription(
                  `See the top 10 users in the fight!`
                );

                for(var i = 0; i < result.length; ++i){
                  var member = guild.members.cache.get(result[i].user);

                  var prettynumber = i + 1;

                  helpMessage.addField(
                    `**${prettynumber}**`,
                    `\`\`\`${member.user.username} - ${result[i].points} (Team ${result[i].team})\`\`\``
                  );

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
    } else {
      pomTeams.sync().then(() => {
        pomTeams.findAll({
          attributes: ["id", "team", "points", [Sequelize.literal('RANK () OVER ( ORDER BY points DESC )'), 'rank']],
          raw: true,
        }).then((result) => {
          if (result.length >= 1) {
            let helpMessage = new Discord.MessageEmbed().setColor('#750384').setTitle('Team Leaderboard').setDescription(`See the ranks of teams!`);
            for (var i = 0; i < result.length; ++i) {
              var teamname = result[i].team;
              helpMessage.addField(`**Team ${teamname[0].toUpperCase() + teamname.slice(1)} (${config.teamnames[teamname]})**`, `\`\`\`${result[i].points}\`\`\``);
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
    }
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