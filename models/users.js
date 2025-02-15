import { Model, Sequelize } from "../db/db.js";
import Lesson from "./Lesson.js";
import Package from "./Package.js";
import Sport from "./Sport.js";
import AverageRate from "./AverageRate.js";
import ChatTimimg from "./ChatTiming.js";
import Chat from "./Chat.js";


const User = Model.define('users', {
    id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    username: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: ""
    },
    name: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: ""
    },
    email: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    // forgotPasswordHash: {
    //     type: Sequelize.STRING(255),
    //     allowNull: true,
    //     defaultValue: ''
    // },
    phone_number: {
        type: Sequelize.BIGINT,
        allowNull: true
    },
    country_code: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: ""
    },
    password: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    type: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: "1=>active,0=>desable"
    },
    // deviceType: {
    //     type: Sequelize.INTEGER,
    //     allowNull: true,
    //     defaultValue: 1,
    //     comment: "1=>android,2=>ios"
    // },
    // deviceToken: {
    //     type: Sequelize.STRING(255),
    //     allowNull: true,
    //     defaultValue: ""
    // },
    otp: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
    role: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "1=user,2=instructor"
    },
    verify_otp: {
        type: Sequelize.TINYINT,
        allowNull: true,
        defaultValue: 0
    },
    social_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: "0"
    },
    age: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: ''

    },
    gender: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: ''

    },
    auth_key: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: ""
    },
    social_type: {
        type: Sequelize.TINYINT,
        allowNull: true,
        defaultValue: 0,
        comment: "simplelogin=> 1, facebook=> 2, google=>3,iphone=>4"
    },
    notification_status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: "0=>off,1=>on"
    },
    latitude: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: '',
    },
    image: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: ''
    },
    longitude: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: '',
    },
    location:{
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: '',
    },
    address:{
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
    },
    rate:{
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '',
    }
}, {

    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

await User.sync({alter: true});

User.hasMany(Package,{sourceKey:"id", foreignKey:'instructor_id'});
User.hasMany(Lesson,{sourceKey:"id", foreignKey:'instructor_id'});
Lesson.belongsTo(User, { foreignKey: 'instructor_id', as: 'user_detail' })
User.hasMany(Sport,{sourceKey:"id", foreignKey:'user_id'});
Sport.hasMany(User, { sourceKey:"user_id", foreignKey: 'id', as: 'user_detail' })
// AverageRate.belongsTo(User, { foreignKey: 'user_id', as: 'rating' })
User.hasOne(AverageRate,{sourceKey:"id", foreignKey:'user_id'})
User.hasOne(ChatTimimg,{sourceKey:"id", foreignKey:'user_id'});

User.hasMany(Chat,{sourceKey:"id", foreignKey:'to'})





export default User;
