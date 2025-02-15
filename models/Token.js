import { Model, Sequelize } from "../db/db.js";

const Token = Model.define('tokens',{

    user_id: {
        type:Sequelize.STRING,
        allowNull: false
      },
      jti: {
        type:Sequelize.STRING,
        allowNull: false
      },
      token: {
        type:Sequelize.STRING,
        allowNull: false
      }
}, {
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});
await Token.sync();
export default Token ;
