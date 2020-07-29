const Discord = require('discord.js');
const pomMembers = require('../databaseFiles/pomMembers');
const pomTeams = require('../databaseFiles/pomTeams');
const Sequelize = require('sequelize');

module.exports.execute = async (client, message, args) => {
  var focus;

  if (args[0]) {
    if (args[0].toLowerCase() == "teams") {
      focus = "teams";
    } else {
      focus = "humans";
    }
  } else {
    focus = "humans";
  }

  try {
    if (focus == "humans") {
      pomMembers.sync().then(() => {
        pomMembers.findAll({
          attributes: [
              "id", "user", "exp", "team",
              [Sequelize.literal('RANK () OVER ( ORDER BY exp DESC )'), 'rank']
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
                    `\`\`\`${member.user.username} - ${result[i].exp} (Team ${result[i].team})\`\`\``
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
          attributes: [
              "id", "team", "exp",
              [Sequelize.literal('RANK () OVER ( ORDER BY exp DESC )'), 'rank']
            ],
            raw: true,
        }).then((result) => {
            if (result.length >= 1) {

              let helpMessage = new Discord.MessageEmbed()
                .setColor('#750384')
                .setTitle('Team Leaderboard')
                .setDescription(
                  `See the ranks of teams!`
                );

                for(var i = 0; i < result.length; ++i){
                  var prettynumber = i + 1;

                  helpMessage.addField(
                    `**${prettynumber}**`,
                    `\`\`\`${result[i].team[0].toUpperCase() + result[i].team.slice(1)} - ${result[i].exp}\`\`\``
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
    }
  } catch (err) {
    console.error("Sequelize error: ", err);
  }
};

module.exports.config = {
  name: 'leaderboard',
  aliases: ['lb', 'top'],
  description: 'See the top ten members.',
  usage: ['profile <user | team number>'],
};