var DataTypes = require("sequelize").DataTypes;
var _rating = require("./rating");

function initModels(sequelize) {
  var rating = _rating(sequelize, DataTypes);


  return {
    rating,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
