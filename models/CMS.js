
import { Model, Sequelize } from "../db/db.js";

const CMS = Model.define('cms', {
  id: {
    autoIncrement: true,
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  title: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false
  }
}, {
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

await CMS.sync();

export default CMS;
















