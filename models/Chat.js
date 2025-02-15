import { Model, Sequelize } from "../db/db.js";

const Chat = Model.define(
  "chats",
  {
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    from: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    to: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    msg: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    block: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '0',
      comment:"1=>blocked,0=>not_blocked"
    },
    read: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '0',
      comment:"1=>read,0=>notread"
    },
    
  },
  {
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

await Chat.sync({alter:true});


export default Chat;
