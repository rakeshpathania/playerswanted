import Sequelize from "sequelize";
import dotenv from "dotenv";
dotenv.config();


// const Model = new Sequelize("playerswanted",  "playerswanted",  "kt0HLkvYOiBdXm4A", {
//   host:  "127.0.0.1",
//   dialect: "mysql",
//   logging: false
// });

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_DIALECT = process.env.DB_DIALECT;

const Model = new Sequelize(DB_NAME,  DB_USER,  DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  logging: true
});


try {
  await Model.authenticate();
  console.log('Connection  established successfully.');

} catch (err) {
  console.error('Unable to connect to the database:', err);
}
export { Sequelize, Model }
