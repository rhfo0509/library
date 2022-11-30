const Sequelize = require("sequelize");

module.exports = class Coupon extends Sequelize.Model {
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
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.STRING(1024),
          allowNull: true,
        },
        discountRate: {
          type: Sequelize.INTEGER(3),
          allowNull: true,
          defaultValue: 0,
        },
        discountPrice: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        minPrice: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
        deletedAt: {
          type: Sequelize.DATE,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Coupon",
        tableName: "coupons",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Coupon.hasMany(db.UserCoupon, {
      foreignKey: "couponId",
      sourceKey: "id",
      onDelete: "cascade",
    });
  }
};
