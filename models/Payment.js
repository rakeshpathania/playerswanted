import { Model, Sequelize } from "../db/db.js";

const Payment = Model.define('payments', {
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
  name_on_card: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  name:{
    type: Sequelize.STRING(255),
    allowNull: false
  },
  card_number:{
    type: Sequelize.STRING(255),
    allowNull: false
  },
  expiry: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  cvv: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, {
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

await Payment.sync();
export default Payment;
