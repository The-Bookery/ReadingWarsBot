const Sequelize = require('sequelize');
const connect = require('./connect.js');

const sequelize = connect.sequelize;

module.exports = sequelize.define('PStats', {
  team: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  exp: {
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
  defending: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});