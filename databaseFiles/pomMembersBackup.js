const Sequelize = require('sequelize');
const connect = require('./connect.js');

const sequelize = connect.sequelize;

module.exports = sequelize.define('PMembersBackup', {
  user: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  team: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  coins: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  points: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  class: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  classchange: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  // The following are stats
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
  }
  // End stats
});