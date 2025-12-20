module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true
    },
    difficulty: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      defaultValue: 'beginner'
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'courses',
    timestamps: true,
    indexes: [
      { fields: ['slug'] },
      { fields: ['isPublished'] }
    ]
  });

  return Course;
};
