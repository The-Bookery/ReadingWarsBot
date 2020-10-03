const pomMembers = require('../databaseFiles/pomMembers');
const pomTeams = require('../databaseFiles/pomTeams');
// call function with variables timestamp1 and timestamp2 in call
function timedifference(timestamp1, timestamp2) {
  // redefine the variables
  timestamp1 = new Date(parseInt(timestamp1));
  timestamp2 = new Date(parseInt(timestamp2));
  let difference = timestamp2.getTime() - timestamp1.getTime();
  difference = Math.floor(difference / 1000 / 60 / 60);
  return difference;
}

function changeNewClass(message, nclass, teamresult, wordteam) {
  if (nclass == "knight") {
    pomTeams.update({
      knights: teamresult[0].knights + 1
    }, {
      where: {
        team: wordteam
      }
    }).then(() => {
      return message.channel.send('Your class has been changed to a **Knight**!');
    });
  } else if (nclass == "thief") {
    pomTeams.update({
      thieves: teamresult[0].thieves + 1
    }, {
      where: {
        team: wordteam
      }
    }).then(() => {
      return message.channel.send('Your class has been changed to a **Thief**!');
    });
  } else if (nclass == "stonemason") {
    pomTeams.update({
      stonemasons: teamresult[0].stonemasons + 1
    }, {
      where: {
        team: wordteam
      }
    }).then(() => {
      return message.channel.send('Your class has been changed to a **Stonemason**!');
    });
  } else if (nclass == "joker") {
    pomTeams.update({
      jokers: teamresult[0].jokers + 1
    }, {
      where: {
        team: wordteam
      }
    }).then(() => {
      return message.channel.send('Your class has been changed to a **Joker**!');
    });
  }
}
module.exports.execute = async (client, message, args) => {
  var nclass; // New class
  var oclass; // Old class
  if (args[0]) {
    nclass = args[0].toLowerCase();
    if (nclass !== "knight" && nclass !== "thief" && nclass !== "stonemason" && nclass !== "joker") {
      return await message.channel.send('Please choose a valid class name!');
    }
  } else {
    return await message.channel.send('Please choose a class!');
  }
  try {
    pomMembers.sync().then(() => {
      pomMembers.findAll({
        where: {
          user: message.author.id
        },
      }).then((result) => {
        if (result.length >= 1) {
          var timeleft = timedifference(result[0].classchange, Date.now());
          if (timeleft < 24) {
            return message.channel.send(`Looks like you've changed your class in the last 24 hours! Please wait ${24 - timeleft} more hours!`);
          }
          var wordteam;
          if (result[0].team == 1) {
            wordteam = "one";
          } else if (result[0].team == 2) {
            wordteam = "two";
          } else {
            wordteam = "three";
          }
          oclass = result[0].class;
          pomMembers.update({
            class: nclass,
            classchange: Date.now()
          }, {
            where: {
              user: message.author.id
            }
          }).then(() => {
            pomTeams.sync().then(() => {
              pomTeams.findAll({
                where: {
                  team: wordteam
                }
              }).then((teamresult) => {
                if (oclass == "knight") {
                  pomTeams.update({
                    knights: teamresult[0].knights - 1
                  }, {
                    where: {
                      team: wordteam
                    }
                  }).then(() => {
                    changeNewClass(message, nclass, teamresult, wordteam);
                  });
                } else if (oclass == "thief") {
                  pomTeams.update({
                    thieves: teamresult[0].thieves - 1
                  }, {
                    where: {
                      team: wordteam
                    }
                  }).then(() => {
                    changeNewClass(message, nclass, teamresult, wordteam);
                  });
                } else if (oclass == "stonemason") {
                  pomTeams.update({
                    stonemasons: teamresult[0].stonemasons - 1
                  }, {
                    where: {
                      team: wordteam
                    }
                  }).then(() => {
                    changeNewClass(message, nclass, teamresult, wordteam);
                  });
                } else if (oclass == "joker") {
                  pomTeams.update({
                    jokers: teamresult[0].jokers - 1
                  }, {
                    where: {
                      team: wordteam
                    }
                  }).then(() => {
                    changeNewClass(message, nclass, teamresult, wordteam);
                  });
                }
              });
            });
          }).catch((err) => {
            console.error('Team error: ', err);
          });
        } else {
          return message.channel.send('Woah! Somehow you aren\'t part of the challenge yet!');
        }
      });
    });
  } catch (err) {
    return message.channel.send("There was an error adding that to the database! Are you sure you used commas around every value?");
  }
};
module.exports.config = {
  name: 'changeclass',
  module: 'Utility',
  aliases: ['cc'],
  description: 'Change your class after 24 hours of changing it last.',
  usage: ['changeclass <knight | thief | stonemason | joker>'],
};