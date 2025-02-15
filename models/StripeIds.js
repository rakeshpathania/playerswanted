import { Model, Sequelize } from "../db/db.js";

const StripeIds = Model.define(
  "stripe_ids",
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
    clientSecret: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    payoutId: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    status:{
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: "0=>failed, 1=>done"
    }
  },
  {
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

await StripeIds.sync();
export default StripeIds;
