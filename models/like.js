const Sequelize = require("sequelize");

module.exports = class Like extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          unique: true,
          primaryKey: true,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Like",
        tableName: "likes",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Like.belongsTo(db.User, { foreignKey: "userId", targetKey: "id" });
    db.Like.belongsTo(db.Book, { foreignKey: "bookId", targetKey: "id" });
  }
};
