const Sequelize = require("sequelize");

module.exports = class Card extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        number: {
          type: Sequelize.STRING(20),
          allowNull: false,
          unique: true,
          primaryKey: true,
        },
        expirationDate: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        company: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Card",
        tableName: "cards",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Card.belongsTo(db.User, { foreignKey: "userId", targetKey: "id" });
  }
};
