const Sequelize = require('sequelize');
const connect = require('./connect.js');

const sequelize = connect.sequelize;

module.exports = sequelize.define('PMembers', {
  user: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  team: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  points: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  exp: {
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
  read: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  attack: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  build: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  bomb: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  defend: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  spy: {
    type: Sequelize.STRING,
    allowNull: false,
  }
});