const Sequelize = require("sequelize");

module.exports = class Order extends Sequelize.Model {
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
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        totalCount: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        totalPrice: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        usedPoint: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        usedStamp: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        cardNumber: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        cardExpDate: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        cardCompany: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        zipCode: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        address: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        detailAddress: {
          type: Sequelize.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Order",
        tableName: "orders",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Order.belongsTo(db.User, { foreignKey: "userId", targetKey: "id" });
    db.Order.hasMany(db.OrderItem, { foreignKey: "orderId", sourceKey: "id", onDelete: "cascade" });
  }
};
