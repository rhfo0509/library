const Sequelize = require("sequelize");

module.exports = class Address extends Sequelize.Model {
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
        modelName: "Address",
        tableName: "addresses",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
        freezeTableName: true,
      }
    );
  }

  static associate(db) {
    db.Address.belongsTo(db.User, { foreignKey: "userId", targetKey: "id" });
  }
};
