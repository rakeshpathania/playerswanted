import { Model, Sequelize } from "../db/db.js";
import Game from "./Game.js";

const Video = Model.define('videos',{

    user_id: {
        type:Sequelize.STRING,
        allowNull: false
      },
      game_id: {
        type:Sequelize.STRING,
        allowNull: false
      },
      title: {
        type:Sequelize.STRING,
        allowNull: false
      },
      description: {
        type:Sequelize.STRING,
        allowNull: false
      },
      url: {
        type:Sequelize.STRING,
        allowNull: false
      },
      type: {
        type:Sequelize.STRING,
        allowNull: false,
        comment:"1=>youtube,0=>other"
      },
      status: {
        type:Sequelize.STRING,
        allowNull: false,
        defaultValue: 1,
        comment:"1=>active,0=>desable"
      }
}, {
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});
await Video.sync({alter: true});

Video.hasOne(Game,{sourceKey:"game_id", foreignKey:'id'})

export default Video ;
