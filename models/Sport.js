import { Model, Sequelize } from "../db/db.js";
import Game from "./Game.js";
import Package from "./Package.js";
import User from "./users.js";

const Sport = Model.define('sports', {
  id: {
    autoIncrement: true,
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  game_id: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  levels: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  certificate: {
    type: Sequelize.STRING(255),
    allowNull: true,
    defaultValue: ''
  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, {
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

await Sport.sync({alter:true});

Sport.hasOne(Game, { sourceKey: "game_id", foreignKey: 'id' })
Sport.hasOne(Package, { sourceKey: "game_id", foreignKey: 'game_id' })
Sport.belongsTo(Game, { foreignKey: 'game_id', as: 'game_detail' })


export default Sport;
