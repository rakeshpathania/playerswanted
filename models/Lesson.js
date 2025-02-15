import { Model, Sequelize } from "../db/db.js";
import User from "./users.js";
import LessonVideos from "./LessonVideos.js";
import Game from "./Game.js";

const Lesson = Model.define(
  "lessons",
  {
    id: {
      autoIncrement: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    instructor_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    game_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    url: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: "1=>youtube,0=>other",
    },
  },
  {
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

await Lesson.sync({ alter: true });

Lesson.hasMany(LessonVideos, { foreignKey: "lesson_id", as: "lesson_videos" });
Lesson.hasOne(Game, { sourceKey: "game_id", foreignKey: "id", as: "game" });


export default Lesson;
