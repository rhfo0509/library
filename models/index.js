const Sequelize = require("sequelize");
const Cart = require("./cart");
const CartItem = require("./cartItem");
const User = require("./user");
const Book = require("./book");
const Card = require("./card");
const Address = require("./address");
const Order = require("./order");
const OrderItem = require("./orderItem");
const Like = require("./like");
const Coupon = require("./coupon");
const UserCoupon = require("./userCoupon");
const Review = require("./review");

const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
db.sequelize = sequelize;

db.User = User;
db.Cart = Cart;
db.CartItem = CartItem;
db.Book = Book;
db.Card = Card;
db.Address = Address;
db.Order = Order;
db.OrderItem = OrderItem;
db.Like = Like;
db.Coupon = Coupon;
db.UserCoupon = UserCoupon;
db.Review = Review;

User.init(sequelize);
Cart.init(sequelize);
CartItem.init(sequelize);
Book.init(sequelize);
Card.init(sequelize);
Address.init(sequelize);
Order.init(sequelize);
OrderItem.init(sequelize);
Like.init(sequelize);
Coupon.init(sequelize);
UserCoupon.init(sequelize);
Review.init(sequelize);

User.associate(db);
Cart.associate(db);
CartItem.associate(db);
Book.associate(db);
Card.associate(db);
Address.associate(db);
Order.associate(db);
OrderItem.associate(db);
Like.associate(db);
Coupon.associate(db);
UserCoupon.associate(db);
Review.associate(db);

module.exports = db;
