import { Model, Sequelize } from "../db/db.js";
const LessonVideos = Model.define('lesson_videos', {
  id: {
    autoIncrement: true,
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  lesson_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  videos: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, {
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

await LessonVideos.sync();


export default LessonVideos;














