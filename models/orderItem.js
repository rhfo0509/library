const Sequelize = require("sequelize");

module.exports = class OrderItem extends Sequelize.Model {
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
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "OrderItem",
        tableName: "orderitems",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.OrderItem.belongsTo(db.Order, {
      foreignKey: "orderId",
      targetKey: "id",
    });
    db.OrderItem.belongsTo(db.Book, { foreignKey: "bookId", targetKey: "id" });
  }
};
