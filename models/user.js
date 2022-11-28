const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: Sequelize.STRING(20),
          allowNull: false,
          unique: true,
          primaryKey: true,
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        stamp: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        point: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        totalPrice: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        grade: {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: "BRONZE",
          values: ["BRONZE", "SLIVER", "GOLD", "PLATINUM", "DIAMOND", "ADMIN"],
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
        modelName: "User",
        tableName: "users",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.User.hasOne(db.Cart, {
      foreignKey: "userId",
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.User.hasMany(db.Card, {
      foreignKey: "userId",
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.User.hasMany(db.Address, {
      foreignKey: "userId",
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.User.hasMany(db.Order, {
      foreignKey: "userId",
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.User.hasMany(db.Like, {
      foreignKey: "userId",
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.User.hasMany(db.Review, {
      foreignKey: "userId",
      sourceKey: "id",
      onDelete: "CASCADE",
    });
  }
};
