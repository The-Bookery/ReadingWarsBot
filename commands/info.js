const config = require('../config.json');
const Discord = require('discord.js');
const rm = require('discord.js-reaction-menu');

module.exports.execute = async (client, message) => {
  new rm.menu(message.channel, message.author.id, [
    new Discord.MessageEmbed()
    .setColor('#750384')
    .setTitle('(#1) Basics')
    .setDescription(
      `The reading wars are fun and competitive events where three teams battle for supremacy on the leaderboard. To climb up the leaderboard, you need to earn coins and trade them in for points using a variety of commands. You can attack other teams and steal their points, defend your team from attacks by building walls, bomb other people's walls, and more. You can also join a class, which will give you different buffs to play to your specific playstyle. The bot will automatically assign you to one of the three teams. Join in and fight your hardest! After a month and a half, the team with the most points wins!`
    ),
    new Discord.MessageEmbed()
    .setColor('#750384')
    .setTitle('(#2) Commands')
    .setDescription(`To see info about all the commands, use \`b-help\`. To see info about a specific command, use \`b-help [command]\`. Upon joining, the bot will automatically assign you a team and you can get started! Here's a bit of info about specific commands:`)
    .addFields(
      { name: `\`b-read [times]\``, value: `This command should be run after doing 25 minutes of reading. Feel free to add a number afterward (e.g. \`b-read 3\`) for a certain number of 25-minute reading. Be sure to actually time yourself while doing this, and stay honest or you could get banned from the event and even future events.` },
      { name: `\`b-attack <team number>\``, value: `This will attempt an attack against the team you target. It can fail on occasion, making you lose the coin, and can be blocked by walls, which will also make you lose the coin. If it succeeds it will take a random amount of coins from the opposing team's top players, and give it to you.`},
      { name: `\`b-tradein [number]\``, value: `This is a safer but less effective way of getting points than attacking. It has an exchange rate of 1 coin to 50 points, which is far from the potential for attack, which is in the 700's. It is suggested you use this more in the early game before the other teams have enough points for your attacks to be useful, however.`}
    ),
    new Discord.MessageEmbed()
    .setColor('#750384')
    .setTitle('(#3) Classes')
    .setDescription(`Classes are a way to add buffs to your moves depending on your play style. You can only change your class every 24 hours. Here are the classes with their perks:`)
    .addFields(
      { name: `Knight`, value: `Has a much-increased chance of succeeding an attack.` },
      { name: `Stonemason`, value: `Can build walls to take seven hits (instead of four), and can do it for only one coin.`},
      { name: `Thief`, value: `Has a chance to steal back a coin when using any move that takes coins.`},
      { name: `Joker`, value: `Has some aspects of all classes. Slight chance to steal back coin when using \`b-bomb\`, a slightly increased chance of a successful attack, can build the walls to take four hits for only one coin (sometimes) and has a chance to get a bonus when trading in coins.`}
    )
  ]), time = 120000, reactions = {first: '⏪', back: '◀', next: '▶', last: '⏩', stop: '⏹'};
};

module.exports.config = {
  name: 'info',
  aliases: ['info'],
  description: 'Learn info about the game.',
  usage: ['hello'],
};