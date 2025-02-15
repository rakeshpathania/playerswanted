import { Model, Sequelize } from "../db/db.js";

const Shop = Model.define('shops', {
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
  description: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  image: {
    type: Sequelize.STRING(255),
    allowNull: false,
    defaultValue:""
  },
  price: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue:0
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

await Shop.sync();

export default Shop;



























