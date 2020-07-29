const config = require('../config.json');
const pomMembers = require('../databaseFiles/pomMembers');
const pomTeams = require('../databaseFiles/pomTeams');

module.exports.execute = async (client, message, args) => {
  var team;
  var wordteam;

  if (message.channel.id === config.channels.teamOne) {
    team = 1;
    wordteam = "one";
  } else if (message.channel.id === config.channels.teamTwo) {
    team = 2;
    wordteam = "two";
  } else if (message.channel.id === config.channels.teamThree) {
    team = 3;
    wordteam = "three";
  } else {
    return await message.channel.send('Not the correct channel!');
  }

  if (args[0] != 1 && args[0] != 2 && args[0] != 3) {
    return await message.channel.send('Looks like you didn\'t target a team!');
  }

  var target = args[0];

  if (target == team) {
    return await message.channel.send('You can\'t target your own team!');
  }

  pomMembers.sync().then(() => {
    pomMembers.findAll({
      where: {
        user: message.author.id,
      },
    }).then((result) => {
      if (result.length == 1) {
        var penalty = 1;
        if (result[0].class == "thief" && Math.floor(Math.random() * 10) > 9) penalty = 0;

        var points = parseInt(result[0].points);

        if (points > 0) {
          points -= penalty;

          pomTeams.sync().then(() => {
            var wordtarget;

            if (target == 1) {
              wordtarget = "one";
            } else if (target == 2) {
              wordtarget = "two";
            } else {
              wordtarget = "three";
            }

            pomTeams.findAll({
              where: {
                team: wordteam,
              },
            }).then((teamresult) => {
              if (teamresult[0].walls > 0) {
                pomTeams.findAll({
                  where: {
                    team: wordtarget,
                  },
                }).then((targetresult) => {
                  var addition = "";
                  var newWalls = targetresult[0].walls - 3;
                  if (result[0].class == "joker" && Math.floor(Math.random() * 10) > 9 && targetresult[0].walls == 4) {newWalls = targetresult[0].walls - 4; addition = " with a +1 damage bonus from your joker class.";}

                  var verb;
                  if (newWalls > 0) verb = "damaged";
                  else if (newWalls == 0) verb = `destroyed`;

                  if (newWalls < 0) newWalls = 0;
                  pomTeams.update(
                    { walls: newWalls },
                    { where: { team: wordtarget } }
                  ).then(() => {
                    pomMembers.update(
                      { points: points,
                        bomb: result[0].bomb + 1 },
                      { where: { user: message.author.id } }
                    ).then(() => {
                      pomTeams.update(
                        { bomb: teamresult[0].bomb + 1 },
                        { where: { team: wordteam }},
                      ).then(() => {
                        return message.channel.send(`You have ${verb} team ${target}'s walls${addition}. Their walls are now at ${newWalls}! You lost ${penalty} point in the process and now have ${result[0].points - 1}.`);
                      });
                    }).catch((error) => {
                      console.log('Update error: ' + error);
                    });
                  });
                });
              } else {
                return message.channel.send('The walls are down! You have been saved your point.');
              }
            });
          });
        } else {
          return message.channel.send(`You don't have enough points for this! You only have ${result[0].points} points.`);
        }
      } else {
        return message.channel.send('Woah! Somehow you aren\'t in the challenge yet! Run `,join` to get started!');
      }
    });
  });
};

module.exports.config = {
  name: 'bomb',
  aliases: [],
  description: 'Breaks down three walls at a time.',
  usage: ['bomb [team number]'],
};