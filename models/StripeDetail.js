import { Model, Sequelize } from "../db/db.js";

const StripeDetail = Model.define(
  "stripe_details",
  {
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    acc_id: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    status: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: "0=>disable, 1=>enable",
        defaultValue: 1
      },
  },
  {
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

await StripeDetail.sync({alter:true});
export default StripeDetail;
