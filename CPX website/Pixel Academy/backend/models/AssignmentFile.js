module.exports = (sequelize, DataTypes) => {
  const AssignmentFile = sequelize.define('AssignmentFile', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    assignmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'assignments',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER, // in bytes
      allowNull: false
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'assignment_files',
    timestamps: true,
    indexes: [
      { fields: ['assignmentId'] }
    ]
  });

  return AssignmentFile;
};
