import { Model, Sequelize } from "../db/db.js";
const ForgetToken = Model.define('forgetTokens', {
    id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: ""
    },
    token: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: ""
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true
    },
    expired_at: {
        type: Sequelize.STRING,
        allowNull: true
    },
},{
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

await ForgetToken.sync();
export default ForgetToken;