import { Model, Sequelize } from "../db/db.js";

const AverageRate = Model.define(
    "averagerates",
    {
        id: {
            autoIncrement: true,
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true
        },

        user_id: {
            type: Sequelize.STRING,
            allowNull: false
        },
        rate: {
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

await AverageRate.sync();


export default AverageRate;
