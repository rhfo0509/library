const Sequelize = require("sequelize");

module.exports = class CartItem extends Sequelize.Model {
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
        count: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "CartItem",
        tableName: "cartitems",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.CartItem.belongsTo(db.Cart, { foreignKey: "cartId", targetKey: "id" });
    db.CartItem.belongsTo(db.Book, { foreignKey: "bookId", targetKey: "id" });
  }
};
