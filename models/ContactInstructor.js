import { Model, Sequelize } from "../db/db.js";

const ContactInstructor = Model.define('contactinstructors', {
    id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    instructor_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    email: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    phone_number: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    subject: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

await ContactInstructor.sync();
export default ContactInstructor;
