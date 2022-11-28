const Sequelize = require("sequelize");

module.exports = class Book extends Sequelize.Model {
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
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        authors: {
          type: Sequelize.STRING,
        },
        publisher: {
          type: Sequelize.STRING,
        },
        price: {
          type: Sequelize.INTEGER,
        },
        count: {
          type: Sequelize.INTEGER,
        },
        thumbnail: {
          type: Sequelize.STRING(1024),
        },
        details: {
          type: Sequelize.STRING(1024),
        },
        likes: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        avgRate: {
          type: Sequelize.FLOAT,
          defaultValue: 0,
        },
        countRate: {
          type: Sequelize.INTEGER,
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
        modelName: "Book",
        tableName: "books",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Book.hasMany(db.CartItem, {
      foreignKey: "bookId",
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.Book.hasMany(db.OrderItem, {
      foreignKey: "bookId",
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.Book.hasMany(db.Like, {
      foreignKey: "bookId",
      sourceKey: "id",
      onDelete: "CASCADE",
    });
    db.Book.hasMany(db.Review, {
      foreignKey: "bookId",
      sourceKey: "id",
      onDelete: "CASCADE",
    });
  }
};
