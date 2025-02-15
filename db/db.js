import Sequelize from "sequelize";
import dotenv from "dotenv";
dotenv.config();


// const Model = new Sequelize("playerswanted",  "playerswanted",  "kt0HLkvYOiBdXm4A", {
//   host:  "127.0.0.1",
//   dialect: "mysql",
//   logging: false
// });

const Model = new Sequelize("playerswanted",  "root",  "root", {
  host:  "127.0.0.1",
  dialect: "mysql",
  logging: true
});


try {
  await Model.authenticate();
  console.log('Connection  established successfully.');

} catch (err) {
  console.error('Unable to connect to the database:', err);
}
export { Sequelize, Model }
