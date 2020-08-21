const Discord = require('discord.js');
const pomTeams = require('../databaseFiles/pomTeams');
const config = require('../config.json');

// call function with variables timestamp1 and timestamp2 in call
function timedifference(timestamp1, timestamp2, time) {
  // redefine the variables
  timestamp1 = new Date(parseInt(timestamp1));
  timestamp2 = new Date(parseInt(timestamp2));

  let difference = timestamp2.getTime() - timestamp1.getTime();

  if (time == "s") difference = Math.floor(difference / 1000);
  if (time == "m") difference = Math.floor(difference / 1000 / 60);

  return difference;
}

module.exports.execute = async (client, message) => {
  var wordteam;

  if (message.channel.id === config.channels.teamOne) {
    wordteam = "one";
  } else if (message.channel.id === config.channels.teamTwo) {
    wordteam = "two";
  } else if (message.channel.id === config.channels.teamThree) {
    wordteam = "three";
  } else {
    return await message.channel.send('Not the correct channel! Please go to your team channel.');
  }

  try {
    pomTeams.findAll({
      where: {
        team: wordteam,
      },
    }).then((result) => {
      var bombcooldown = 30 - timedifference(result[0].bombcooldown, Date.now(), "s");
      if (bombcooldown < 0) bombcooldown = 0;
      var wallcooldown = 120 - timedifference(result[0].wallcooldown, Date.now(), "s");
      if (wallcooldown < 0) wallcooldown = 0;
      var threecooldown = 30 - timedifference(result[0].teamthree, Date.now(), "m");
      if (threecooldown < 0) threecooldown = 0;
      var twocooldown = 30 - timedifference(result[0].teamtwo, Date.now(), "m");
      if (twocooldown < 0) twocooldown = 0;
      var onecooldown = 30 - timedifference(result[0].teamone, Date.now(), "m");
      if (onecooldown < 0) onecooldown = 0;

      let helpMessage = new Discord.MessageEmbed()
      .setColor('#750384')
      .setTitle('Team info for the ' + config.teamnames[wordteam] + '.')
      .setDescription(`See statistics about team ${wordteam}.`)
      .addFields({
        name: `Walls`,
        value: `\`\`\`${result[0].walls}\`\`\``,
      }, {
        name: `Team One Attack`,
        value: `\`\`\`${onecooldown} minutes\`\`\``,
        inline: true
      }, {
        name: `Team Two Attack`,
        value: `\`\`\`${twocooldown} minutes\`\`\``,
        inline: true
      }, {
        name: `Team Three Attack`,
        value: `\`\`\`${threecooldown} minutes\`\`\``,
        inline: true
      }, {
        name: `Build Cooldown`,
        value: `\`\`\`${wallcooldown} seconds\`\`\``,
        inline: true
      }, {
        name: `Bomb Cooldown`,
        value: `\`\`\`${bombcooldown} seconds\`\`\``,
        inline: true
      }, {
        name: `Coin Stash`,
        value: `\`\`\`${result[0].coinstash}\`\`\``,
        inline: true
      },);
      try {
        return message.channel.send(helpMessage);
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.error("Sequelize error: ", err);
  }
};
module.exports.config = {
  name: 'teamstats',
  aliases: ['team', 'teaminfo'],
  description: 'Learn private info about your team.',
  usage: ['teamstats'],
};