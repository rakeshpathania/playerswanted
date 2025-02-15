import { Model, Sequelize } from "../db/db.js";

const ContactUs = Model.define('contactus', {
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
  email: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  message: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  type: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
}, {
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

await ContactUs.sync();
export default ContactUs;



