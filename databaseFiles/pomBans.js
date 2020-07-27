const Sequelize = require('sequelize');
const connect = require('./connect.js');

const sequelize = connect.sequelize;

module.exports = sequelize.define('PBans', {
  user: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  }
});