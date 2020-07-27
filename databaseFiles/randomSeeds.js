const Sequelize = require('sequelize');
const connect = require('./connect.js');

const sequelize = connect.sequelize;

module.exports = sequelize.define('randomSeeds', {
  random: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  time: {
    type: Sequelize.STRING,
    allowNull: false
  }
});