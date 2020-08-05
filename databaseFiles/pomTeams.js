const Sequelize = require('sequelize');
const connect = require('./connect.js');

const sequelize = connect.sequelize;

module.exports = sequelize.define('PStats', {
  team: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  points: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  members: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  walls: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  wallcooldown: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  bombcooldown: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  coinstash:{
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  // The following are stats
  stonemasons: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  thieves: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  knights: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  jokers: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  read: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  tradein: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  attack: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  build: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  bomb: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  // End stats
  // The following is for attack cooldown
  teamone: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  teamtwo: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  teamthree: {
    type: Sequelize.STRING,
    allowNull: true,
  }
});