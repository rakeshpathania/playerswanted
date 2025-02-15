import { Model, Sequelize } from "../db/db.js";

const Rate = Model.define(
  "rates",
  {
    id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      rate_from: {
        type: Sequelize.STRING,
        allowNull: false
      },
      rate_to: {
        type: Sequelize.STRING,
        allowNull: false
      },
      rate: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      review: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      }
  },
  {
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

await Rate.sync({alter:true});


export default Rate;
