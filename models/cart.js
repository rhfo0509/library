const Sequelize = require("sequelize");

module.exports = class Cart extends Sequelize.Model {
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
        modelName: "Cart",
        tableName: "carts",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Cart.belongsTo(db.User, { foreignKey: "userId", targetKey: "id" });
    db.Cart.hasMany(db.CartItem, { foreignKey: "cartId", sourceKey: "id" });
  }
};
