const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, Sequelize);
db.Course = require('./Course')(sequelize, Sequelize);
db.Module = require('./Module')(sequelize, Sequelize);
db.Chapter = require('./Chapter')(sequelize, Sequelize);
db.Enrollment = require('./Enrollment')(sequelize, Sequelize);
db.Progress = require('./Progress')(sequelize, Sequelize);
db.Assignment = require('./Assignment')(sequelize, Sequelize);
db.AssignmentFile = require('./AssignmentFile')(sequelize, Sequelize);

// Define associations
// User - Enrollment (One-to-Many)
db.User.hasMany(db.Enrollment, { foreignKey: 'userId', as: 'enrollments' });
db.Enrollment.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Course - Enrollment (One-to-Many)
db.Course.hasMany(db.Enrollment, { foreignKey: 'courseId', as: 'enrollments' });
db.Enrollment.belongsTo(db.Course, { foreignKey: 'courseId', as: 'course' });

// Course - Module (One-to-Many)
db.Course.hasMany(db.Module, { foreignKey: 'courseId', as: 'modules' });
db.Module.belongsTo(db.Course, { foreignKey: 'courseId', as: 'course' });

// Module - Chapter (One-to-Many)
db.Module.hasMany(db.Chapter, { foreignKey: 'moduleId', as: 'chapters' });
db.Chapter.belongsTo(db.Module, { foreignKey: 'moduleId', as: 'module' });

// User - Progress (One-to-Many)
db.User.hasMany(db.Progress, { foreignKey: 'userId', as: 'progress' });
db.Progress.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Course - Progress (One-to-Many)
db.Course.hasMany(db.Progress, { foreignKey: 'courseId', as: 'progress' });
db.Progress.belongsTo(db.Course, { foreignKey: 'courseId', as: 'course' });

// Module - Progress (One-to-Many)
db.Module.hasMany(db.Progress, { foreignKey: 'moduleId', as: 'progress' });
db.Progress.belongsTo(db.Module, { foreignKey: 'moduleId', as: 'module' });

// Chapter - Progress (One-to-Many)
db.Chapter.hasMany(db.Progress, { foreignKey: 'chapterId', as: 'progress' });
db.Progress.belongsTo(db.Chapter, { foreignKey: 'chapterId', as: 'chapter' });

// User - Assignment (One-to-Many)
db.User.hasMany(db.Assignment, { foreignKey: 'userId', as: 'assignments' });
db.Assignment.belongsTo(db.User, { foreignKey: 'userId', as: 'student' });

// Module - Assignment (One-to-Many)
db.Module.hasMany(db.Assignment, { foreignKey: 'moduleId', as: 'assignments' });
db.Assignment.belongsTo(db.Module, { foreignKey: 'moduleId', as: 'module' });

// Assignment - AssignmentFile (One-to-Many)
db.Assignment.hasMany(db.AssignmentFile, { foreignKey: 'assignmentId', as: 'files' });
db.AssignmentFile.belongsTo(db.Assignment, { foreignKey: 'assignmentId', as: 'assignment' });

// Reviewer relationship
db.Assignment.belongsTo(db.User, { foreignKey: 'reviewedBy', as: 'reviewer' });

module.exports = db;
