import { Model, Sequelize } from "../db/db.js";
import Game from "./Game.js";

const Subscription = Model.define('subscriptions', {
  id: {
    autoIncrement: true,
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  instructor_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  game_id: {
    type: Sequelize.STRING,
    allowNull: false
  },
  package_amount: {
    type: Sequelize.STRING,
    allowNull: false
  },
  package_duration: {
    type: Sequelize.STRING,
    allowNull: false
  },
  expired_at:{
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "",
  },
  status:{
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "1",
    comment:"1=>active,0=>desable"
  }
}, {
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

await Subscription.sync({alter:true});

Subscription.hasOne(Game,{sourceKey:"game_id", foreignKey:'id'})

export default Subscription;



