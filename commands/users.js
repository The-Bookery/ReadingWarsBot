const Discord = require('discord.js');
const pomMembers = require('../databaseFiles/pomMembers');

module.exports.execute = async (client, message, args) => {
  var wordteam;
  var team;

  if (args[0] == 1) {
    team = 1;
    wordteam = "one";
  } else if (args[0] == 2) {
    team = 2;
    wordteam = "two";
  } else if (args[0] == 3) {
    team = 3;
    wordteam = "three";
  } else {
    return await message.channel.send('Please select a team!');
  }

  try {
    var page;
    if (args[1] && parseInt(args[1])) {
      page = Math.floor(parseInt(args[1]));
      if (page < 1) {
        return await message.channel.send('You must have a number greater than 0!');
      }
    } else if (!args[1]) {
      page = 1;
    } else {
      return await message.channel.send('Looks like you didn\'t input a proper page number! Try again.');
    }

    page -= 1;

    pomMembers.findAll({
      where: {
        team: team,
      },
    }).then((result) => {
      let embedMessage = new Discord.MessageEmbed()
      .setColor('#750384')
      .setTitle('Users in team ' + wordteam + '.')
      .setDescription(`A list of users in a specified team in no specific order.`);

      var userlist = "";
      const guild = client.guilds.cache.get(message.guild.id);

      var lines = 10;
      if (result.length < 10) lines = result.length;

      if (!result[page * 10]) return message.channel.send(':x: Looks like your page number is out of range! Try again with a lower page number.');

      for (var i = page * 10; i < (page * 10) + lines; ++i) {
        if (result[i].user) {
          var member = guild.members.cache.get(result[i].user);

          var name = member.user.username;
          if (member.nickname) name = member.nickname;

          userlist = userlist + name + "\n";
        } else break;
      }

      embedMessage.addField(
        "Users on This Team",
        userlist
      );

      try {
        return message.channel.send(embedMessage);
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.error("Sequelize error: ", err);
  }
};
module.exports.config = {
  name: 'users',
  aliases: ['teammembers'],
  description: 'See a list of a team\'s members.',
  usage: ['users <team> [page]'],
};