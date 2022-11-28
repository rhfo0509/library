const Sequelize = require("sequelize");

module.exports = class Review extends Sequelize.Model {
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
        contents: {
          type: Sequelize.STRING(1024),
          allowNull: false,
        },
        rate: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Review",
        tableName: "reviews",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Review.belongsTo(db.User, { foreignKey: "userId", targetKey: "id" });
    db.Review.belongsTo(db.Book, { foreignKey: "bookId", targetKey: "id" });
  }
};
