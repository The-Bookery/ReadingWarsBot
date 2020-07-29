const Discord = require('discord.js');
const pomMembers = require('../databaseFiles/pomMembers');
const pomTeams = require('../databaseFiles/pomTeams');
const Sequelize = require('sequelize');

module.exports.execute = async (client, message, args) => {
  var userid;
  var team;

  if (args[0] && args.length !== 0) {
    if (parseInt(args[0])) {
      if (args[0].length == 1) {
        team = args[0];
      } else {
        userid = args[0];
      }
    } else {
      var name = args.join(' ');
      //Replace with mention if possible
      if (message.mentions.users.first()) {
        userid = message.mentions.users.first().id;
      } else {
        message.channel.members.forEach((member) => {
          if (
            member.displayName.toLowerCase().indexOf(name.toLowerCase()) != -1 ||
            member.user.username.toLowerCase().indexOf(name.toLowerCase()) != -1
          )
          userid = member.id;
        });
        if (name == '@everyone') {
          return await message.channel.send('You cannot see everyone\'s stats! Try looking at the leaderboard with `,leaderboard`.');
        }
      }
    }
  } else {
    userid = message.author.id;
  }

  if (!team) { // Only runs if userid is set, in other words if they're looking for a specific user
    if (userid == "712698434670297108") { // Special case for Finriq
      let helpMessage = new Discord.MessageEmbed()
        .setColor('#750384')
        .setTitle('Statistics for Finriq.')
        .setDescription(
          `See granular statistics about this user's habits.`
        )
        .addFields(
          { name: `Exp`, value: `\`\`\`∞\`\`\``, inline: true },
          { name: `Global Rank`, value: `\`\`\`∞\`\`\``, inline: true },
        )
        .addField(
          `Class`,
          `\`\`\`Finriq\`\`\``
        )
        .addField(
          `Points`,
          `\`\`\`∞\`\`\``
        )
        .addFields(
          { name: 'Read', value: `\`\`\`∞\`\`\``, inline: true },
          { name: 'Trade In', value: `\`\`\`∞\`\`\``, inline: true },
          { name: 'Attack', value: `\`\`\`∞\`\`\``, inline: true },
          { name: 'Build', value: `\`\`\`∞\`\`\``, inline: true },
          { name: 'Bomb', value: `\`\`\`∞\`\`\``, inline: true },
        );
      try {
        return message.channel.send(helpMessage);
      } catch (err) {
        console.log(err);
      }
    }

    pomMembers.sync().then(() => {
      try {
        pomMembers.findAll({
          attributes: [
              "id", "user",
              [Sequelize.literal('RANK () OVER ( ORDER BY exp DESC )'), 'rank']
            ],
            raw: true,
        }).then((rankresult) => {
          pomMembers.findAll({
            where: {
              user: userid,
            },
          }).then((result) => {
            if (result.length == 1) {
              var rank;

              for(var i = 0; i < rankresult.length; ++i) {
                if (rankresult[i].user == userid) {
                  rank = rankresult[i].rank;
                  break;
                }
              }

              const guild = client.guilds.cache.get(message.guild.id);
              const member = guild.members.cache.get(userid);

              let helpMessage = new Discord.MessageEmbed()
                .setColor('#750384')
                .setTitle('Statistics for ' + member.user.username + '.')
                .setDescription(
                  `See granular statistics about this user's habits.`
                )
                .addFields(
                  { name: `Exp`, value: `\`\`\`${result[0].exp}\`\`\``, inline: true },
                  { name: `Global Rank`, value: `\`\`\`${rank}\`\`\``, inline: true },
                )
                .addFields(
                  { name: `Team`, value: `\`\`\`${result[0].team[0].toUpperCase() + result[0].team.slice(1)}\`\`\`` },
                  { name: `Class`, value: `\`\`\`${result[0].class[0].toUpperCase() + result[0].class.slice(1)}\`\`\`` },
                  { name: `Points`, value: `\`\`\`${result[0].points}\`\`\`` },
                )
                .addFields(
                  { name: 'Read', value: `\`\`\`${result[0].read}\`\`\``, inline: true },
                  { name: 'Trade In', value: `\`\`\`${result[0].tradein}\`\`\``, inline: true },
                  { name: 'Attack', value: `\`\`\`${result[0].attack}\`\`\``, inline: true },
                  { name: 'Build', value: `\`\`\`${result[0].build}\`\`\``, inline: true },
                  { name: 'Bomb', value: `\`\`\`${result[0].bomb}\`\`\``, inline: true },
                );
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
        console.error("Sequelize error: ", err);
      }
    });
  } else {
    var wordteam;

    if (team == 1) {
      wordteam = "one";
    } else if (team == 2) {
      wordteam = "two";
    } else {
      wordteam = "three";
    }

    try {
      pomTeams.findAll({
        attributes: [
            "id", "team",
            [Sequelize.literal('RANK () OVER ( ORDER BY exp DESC )'), 'rank']
          ],
          raw: true,
      }).then((rankresult) => {
        pomTeams.findAll({
          where: {
            team: wordteam,
          },
        }).then((result) => {
          var rank;

          for(var i = 0; i < rankresult.length; ++i) {
            if (rankresult[i].team == wordteam) {
              rank = rankresult[i].rank;
              break;
            }
          }

          let memberCount = result[0].knights + result[0].thieves + result[0].jokers + result[0].stonemasons;

          let helpMessage = new Discord.MessageEmbed()
            .setColor('#750384')
            .setTitle('Statistics for team ' + wordteam + '.')
            .setDescription(
              `See statistics about this team's habits.`
            )
            .addFields(
              { name: `Exp`, value: `\`\`\`${result[0].exp}\`\`\``, inline: true },
              { name: `Team Rank`, value: `\`\`\`${rank}\`\`\``, inline: true },
            )
            .addField (
              'Member Total',
              '```Total: ' + memberCount + '```'
            )
            .addField(
              'Member Breakdown',
              `\`\`\`Knights: ${result[0].knights}
Thieves: ${result[0].thieves}
Stonemasons: ${result[0].stonemasons}
Jokers: ${result[0].jokers}\`\`\``
            )
            .addFields(
              { name: 'Read', value: `\`\`\`${result[0].read}\`\`\``, inline: true },
              { name: 'Trade In', value: `\`\`\`${result[0].tradein}\`\`\``, inline: true },
              { name: 'Attack', value: `\`\`\`${result[0].attack}\`\`\``, inline: true },
              { name: 'Build', value: `\`\`\`${result[0].build}\`\`\``, inline: true },
              { name: 'Bomb', value: `\`\`\`${result[0].bomb}\`\`\``, inline: true },
            );
          try {
            return message.channel.send(helpMessage);
          } catch (err) {
            console.log(err);
          }
        });
      });
    } catch (err) {
      console.error("Sequelize error: ", err);
    }
  }
};

module.exports.config = {
  name: 'profile',
  aliases: ['rank', 'stats'],
  description: 'Learn about a team\'s stats, or a specific user.',
  usage: ['profile <user | team number>'],
};