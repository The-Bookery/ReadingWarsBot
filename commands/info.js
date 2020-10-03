const Discord = require('discord.js');
const rm = require('discord.js-reaction-menu');
module.exports.execute = async (client, message) => {
  new rm.menu(message.channel, message.author.id, [
    new Discord.MessageEmbed()
    .setColor('#750384')
    .setTitle('(#1) Basics')
    .setDescription(`“The Reading War” is a fun and competitive event where three teams battle for supremacy on the leaderboard! To climb the board, you’ll need to earn points for your team.

For every fifteen minutes you read, you will earn a coin for your team. Coins can be traded in for points, or they can be used to attack teams and steal their points. You can also use the coins to build walls for your team to defend yourself from the opposing teams.
    
Though your team will be randomly assigned, you will get to select a class (e.g. stonemason, thief, jester, or knight) when joining the game. Each class comes with its own set of buffs that will allow you to play to different game-styles.
    
Join in and fight your hardest! After a month and a half (45 days), the team with the most points wins!
    `)
    .addField('Turn the Page!', 'To turn the page, react to this message with `▶`.'),
    new Discord.MessageEmbed()
    .setColor('#750384')
    .setTitle('(#2) Team Commands')
    .setDescription(`This is a basic overview of some of the more important commands. For more info about all the commands, run \`b-help\`.
Key: \`[optional argument]\`	\`<required argument>\`	\`this | or this\``)
    .addFields({
      name: `\`b-join <class>\``,
      value: `Use this command to join The Reading Wars! You will be assigned to a team at random, who you will fight alongside with during the event. You can choose your class. (More info on classes on the next page.)`
    }, {
      name: `\`b-read [times]\``,
      value: `This command should be run after doing 15 minutes of reading. Feel free to add a number afterward (e.g. \`b-read 3\`) for a certain amount of 15-minute reading times. Be sure to time yourself while doing this (you could, for example, set a 2 hour timer and then use \`b-read 8\`). Stay honest and do not spam points without reading or you could get banned from the event and even future events.`
    }, {
      name: `\`b-attack <team number>\``,
      value: `This will attempt an attack against the team you target. It can fail on occasion, making you lose the coin, and can be blocked by walls, which will also make you lose the coin. If it succeeds, it will take a random amount of coins from the opposing team's top players, and give it to you.`
    }, {
      name: `\`b-tradein [number]\` `,
      value: `This is a safer but less effective way of getting points than attacking. It has an exchange rate of 100 points to 1 coin, which is far from the potential for attack. It is suggested you use this more in the early game before the other teams have enough points for your attacks to be useful, however.`
    }, {
      name: `\`b-bomb <team number>\``,
      value: `Does a certain amount of damage (RNG-based) to whichever team's walls you target. It is more efficient than the attack command, therefore, because it does far more damage to walls than attacks do. However, it does not earn you any points. The user must wait for 30 seconds before they can bomb again.`
    })
    .addField('Turn the Page!', 'To turn to the next page, react to this message with `▶`. To go back, react with `◀`.'),
    new Discord.MessageEmbed()
    .setColor('#750384')
    .setTitle('(#3) Classes')
    .setDescription(`Classes are a way to add buffs to your moves depending on your play style. You can only change your class every 24 hours. Here are the classes with their perks:`)
    .addFields({
      name: `Knight`,
      value: `Has an increased chance of a successful attack.`
    }, {
      name: `Stonemason`,
      value: `Can build walls to take six hits (instead of four).`
    }, {
      name: `Thief`,
      value: `Has a chance to steal back a coin when using any move that takes coins.`
    }, {
      name: `Joker`,
      value: `Has some aspects of all classes. Slight chance to steal back coin when using \`b-bomb\`, a slightly increased chance of a successful attack, can build the walls to take four hits for only one coin (sometimes) and has a chance to get a bonus when trading in coins.`
    })
    .addField('Turn the Page!', 'To go back to the first page, react to this message with `⏪`. To go back one, react with `◀`. To stop this menu, react with `⏹`.')
  ]), time = 120000, reactions = {
    first: '⏪',
    back: '◀',
    next: '▶',
    last: '⏩',
    stop: '⏹'
  };
};
module.exports.config = {
  name: 'info',
  module: 'General',
  aliases: ['info'],
  description: 'Learn basic info about the game.',
  usage: ['info'],
};