const pomMembers = require('../databaseFiles/pomMembers');

function pluralFinder(requestedcoins) {
  let plural = "coins";
  if (requestedcoins === 1) plural = "coins";
  return plural;
}

module.exports.execute = async (client, message, args) => {
  var requestedcoins;
  if (args[1] && parseInt(args[1])) {
    requestedcoins = Math.floor(parseInt(args[1]));
    if (requestedcoins < 1) {
      return await message.channel.send('You must have a number greater than 0!');
    }
  } else if (!args[1]) {
    requestedcoins = 1;
  } else {
    return await message.channel.send('Looks like you didn\'t input a proper number! Try again.');
  }

  var userid;

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
          if (member.displayName.toLowerCase().indexOf(name.toLowerCase()) != -1 || member.user.username.toLowerCase().indexOf(name.toLowerCase()) != -1) userid = member.id;
        });
        if (name == '@everyone') {
          return await message.channel.send('You cannot send to everyone\'s!');
        }
      }
    }
  } else {
    return await message.channel.send(':x: Couldn\'t find that user! Try again.');
  }

  pomMembers.sync().then(() => {
    pomMembers.findAll({
      where: {
        user: message.author.id,
      },
    }).then((senderresult) => {
      pomMembers.findAll({
        where: {
          user: userid,
        },
      }).then((receiverresult) => {
        if (receiverresult[0].team == senderresult[0].team) {
          pomMembers.update({
            coins: senderresult[0].coins - requestedcoins
          }, {
            where: {
              user: message.author.id
            }
          }).then(() => {
            pomMembers.update({
              coins: receiverresult[0].coins + requestedcoins
            }, {
              where: {
                user: userid
              }
            }).then(() => {
              var verb = pluralFinder(requestedcoins);
              return message.channel.send(`:handshake: You have send ${requestedcoins} ${verb} to the specified user. You now have a total of ${senderresult[0].coins - requestedcoins} and they have a total of ${receiverresult[0].coins + requestedcoins}.`);
            });
          });
        } else {
          return message.channel.send(':x: Looks like you\'re trying to transfer to someone outside your team... *you traitor*.');
        }
      });
    });
  });
};
module.exports.config = {
  name: 'transfer',
  aliases: ['send'],
  description: 'Send a user your coins!',
  usage: ['transfer <user> [coins]'],
};