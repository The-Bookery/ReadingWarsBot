const Discord = require('discord.js');
const pausedCommands = require('../databaseFiles/pausedCommands');

module.exports.execute = async (client, message, args, prefix) => {
  let commands = client.commands;
  let commandNames = [];

  await pausedCommands.sync();
  var result = await pausedCommands.findAll();

  if (!args || args.length === 0) {
    let helpMessage = new Discord.MessageEmbed()
      .setColor('#750384')
      .setTitle('List of available commands')
      .setDescription(
        `Commands available in ${message.guild.name}. Use \`${prefix}help [command]\` for more about a specific command.`
      );

      commands.forEach((requestedcommand) => {
        var adminonly = "";
        if (requestedcommand.config.adminonly == true) adminonly = "**(Admin Only)** ";

        if (result.find(element => element.name == requestedcommand.config.name)) {
          helpMessage.addField(
            `\`\`\`${prefix}${requestedcommand.config.name}\`\`\` (**PAUSED**)`,
            `${adminonly}${requestedcommand.config.description}`
          );
        } else {
          helpMessage.addField(
            `**${prefix}${requestedcommand.config.name}**`,
            `${adminonly}${requestedcommand.config.description}`
          );
        }
      });
    try {
      return await message.channel.send(helpMessage);
    } catch (err) {
      console.log(err);
    }
  } else if (args.length === 1) {
    let command = commands.find(
      (requestedcommand) =>
        requestedcommand.config.name === args[0].toLowerCase() ||
        requestedcommand.config.aliases.find(
          (alias) => alias === args[0].toLowerCase()
        )
    );

    if (command) {
      console.log(command);
      let helpMessage = new Discord.MessageEmbed()
        .setColor('#750384')
        .setTitle(`${prefix}${command.config.name}`)
        .setDescription(
          `You asked for information on \`${prefix}${command.config.name}\``
        );
      helpMessage.addField('Description:', command.config.description);
      helpMessage.addField('Aliases:', command.config.aliases);
      helpMessage.addField('Usage:', command.config.usage);

      try {
        return await message.channel.send(helpMessage);
      } catch (err) {
        console.log(err);
      }
    }
    return await didYouMean(commandNames, args[0].toLowerCase(), message);
  }
};

async function didYouMean(commands, search, message) {
  if (!commands.includes(search)) {
    let score = [];
    let lev = 1000;
    let str = [];
    for (let command of commands) {
      if (levenshtein(search, command) <= lev) {
        lev = levenshtein(search, command);
        str.push(command);
      }
    }
    if (str.length > 1) {
      let arr = [];
      for (let string of str) {
        arr.push(string.split(''));
      }
      for (let i = 0; i < arr.length; i++) {
        score[i] = 0;
        for (let j = 0; j < arr[i].length; j++) {
          if (search.split('')[j] === arr[i][j]) {
            score[i]++;
          }
        }
      }
      return await message.channel
        .send(
          `Did you mean \`${prefix}help ${
            str[score.indexOf(Math.max(...score))]
          }\`?`
        )
        .catch((err) => console.log(err));
    } else {
      return await message.channel
        .send(`Did you mean \`${prefix}help ${str[0]}\`?`)
        .catch((err) => console.log(err));
    }
  }
}

function levenshtein(searchTerm, commandName) {
  if (searchTerm.length === 0) return commandName.length;
  if (commandName.length === 0) return searchTerm.length;
  let tmp, i, j, previous, val, row;
  if (searchTerm.length > commandName.length) {
    tmp = searchTerm;
    searchTerm = commandName;
    commandName = tmp;
  }

  row = Array(searchTerm.length + 1);
  for (i = 0; i <= searchTerm.length; i++) {
    row[i] = i;
  }

  for (i = 1; i <= commandName.length; i++) {
    previous = i;
    for (j = 1; j <= searchTerm.length; j++) {
      if (commandName[i - 1] === searchTerm[j - 1]) {
        val = row[j - 1];
      } else {
        val = Math.min(row[j - 1] + 1, Math.min(previous + 1, row[j] + 1));
      }
      row[j - 1] = previous;
      previous = val;
    }
    row[searchTerm.length] = previous;
  }
  return row[searchTerm.length];
}

module.exports.config = {
  name: 'help',
  aliases: ['help'],
  module: 'Utility',
  description:
    'I will send you this message, or the usage of a specific command.',
  usage: ['help', 'help command'],
};
