import { Model, Sequelize } from "../db/db.js";

const Package = Model.define('packages', {
  id: {
    autoIncrement: true,
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  instructor_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  game_id: {
    type: Sequelize.STRING,
    allowNull: false
  },
  per_month: {
    type: Sequelize.STRING,
    allowNull: false
  },
  per_halfyear: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  per_year:{
    type: Sequelize.STRING,
    allowNull: false,
  },
  experience: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

await Package.sync({alter:true});
export default Package;



