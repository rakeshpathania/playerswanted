
import { Model, Sequelize } from "../db/db.js";

const Game = Model.define('games', {
  id: {
    autoIncrement: true,
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  image: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue:0
  }
}, {
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

await Game.sync({alter:true});


export default Game;
