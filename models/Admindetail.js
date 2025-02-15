
import { Model, Sequelize } from "../db/db.js";
const Admindetail = Model.define('admindetail', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true, // Automatically generates an ID
  },
  name: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  email: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  password: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  image: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
}, {
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

await Admindetail.sync();

export default Admindetail;




