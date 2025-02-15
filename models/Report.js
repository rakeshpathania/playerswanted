import { Model, Sequelize } from "../db/db.js";

const Report = Model.define(
  "reports",
  {
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    report_from: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    report_to: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    msg: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

await Report.sync();


export default Report;
