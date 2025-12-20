module.exports = (sequelize, DataTypes) => {
  const Progress = sequelize.define('Progress', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    moduleId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'modules',
        key: 'id'
      }
    },
    chapterId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'chapters',
        key: 'id'
      }
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    timeSpent: {
      type: DataTypes.INTEGER, // in seconds
      defaultValue: 0
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'progress',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['userId', 'courseId', 'moduleId', 'chapterId'] },
      { fields: ['userId', 'courseId'] },
      { fields: ['completed'] }
    ]
  });

  return Progress;
};
