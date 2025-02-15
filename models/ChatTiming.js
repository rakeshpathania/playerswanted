import { Model, Sequelize } from "../db/db.js";

const ChatTimimg = Model.define(
  "chattimings",
  {
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    socket_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    online: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "0",
    },
    intime: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    },
    outtime: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    },
    min_difference: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    },
    sec_difference: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    },
  },
  {
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

await ChatTimimg.sync({alter:true});
export default ChatTimimg;
