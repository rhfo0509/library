const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { User, Book, Coupon } = require("../models");
const { Op } = require("sequelize");

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.formatDate = function (date) {
    date.setHours(date.getHours() + 9);
    return date.toISOString().replace("T", " ").substring(0, 19);
  };
  next();
});

router.delete("/user", isLoggedIn, async (req, res, next) => {
  try {
    await User.destroy({
      where: {
        id: req.body.id,
      },
    });
    return res.send("deleted");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// localhost:3001/admin/user
router.get("/user", isLoggedIn, async (req, res, next) => {
  const query = req.query.id;
  try {
    if (!query) {
      const users = await User.findAll({
        attributes: { exclude: ["password"] },
        where: {
          grade: { [Op.ne]: "ADMIN" },
        },
      });
      res.render("admin/user", {
        title: "유저 목록 | 관리자",
        users,
      });
    } else {
      const users = await User.findAll({
        attributes: { exclude: ["password"] },
        where: {
          id: {
            [Op.like]: "%" + query + "%",
          },
        },
      });
      res.render("admin/user", {
        title: "유저 목록 | 관리자",
        users,
      });
    }
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.get("/coupon/create", isLoggedIn, async (req, res) => {
  res.render("admin/coupon/create", { title: "쿠폰 등록 | 관리자" });
});

router.get("/coupon/edit", isLoggedIn, async (req, res) => {
  res.render("admin/coupon/edit", { title: "쿠폰 수정 | 관리자" });
});

router.put("/coupon", isLoggedIn, async (req, res, next) => {
  try {
    const { id, name, description, discountRate, discountPrice, minPrice } =
      req.body.result;

    await Coupon.update(
      {
        name,
        description,
        discountRate,
        discountPrice,
        minPrice,
      },
      {
        where: {
          id,
        },
      }
    );

    res.send("edited");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.post("/coupon", isLoggedIn, async (req, res, next) => {
  try {
    const { name, description, discountRate, discountPrice, minPrice } =
      req.body.result;

    await Coupon.create({
      name,
      description,
      discountRate,
      discountPrice,
      minPrice,
    });

    res.send("created");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.delete("/coupon", isLoggedIn, async (req, res, next) => {
  try {
    await Coupon.destroy({
      where: {
        id: req.body.id,
      },
    });
    return res.send("deleted");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// localhost:3001/admin/coupon
router.get("/coupon", isLoggedIn, async (req, res, next) => {
  const query = req.query.name;
  try {
    if (!query) {
      const coupons = await Coupon.findAll({});
      res.render("admin/coupon", {
        title: "쿠폰 목록 | 관리자",
        coupons,
      });
    } else {
      const coupons = await Coupon.findAll({
        where: {
          name: {
            [Op.like]: "%" + query + "%",
          },
        },
      });
      res.render("admin/coupon", {
        title: "쿠폰 목록 | 관리자",
        coupons,
      });
    }
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.get("/book/create", isLoggedIn, async (req, res) => {
  res.render("admin/book/create", { title: "도서 등록 | 관리자" });
});

router.get("/book/edit", isLoggedIn, async (req, res) => {
  res.render("admin/book/edit", { title: "도서 수정 | 관리자" });
});

router.put("/book", isLoggedIn, async (req, res, next) => {
  try {
    const { id, title, authors, publisher, price, count, thumbnail, details } =
      req.body.result;

    await Book.update(
      {
        title,
        authors,
        publisher,
        price,
        count,
        thumbnail,
        details,
      },
      {
        where: {
          id,
        },
      }
    );

    res.send("edited");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.post("/book", isLoggedIn, async (req, res, next) => {
  try {
    const { title, authors, publisher, price, count, thumbnail, details } =
      req.body.result;

    await Book.create({
      title,
      authors,
      publisher,
      price,
      count,
      thumbnail,
      details,
    });

    res.send("created");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.delete("/book", isLoggedIn, async (req, res, next) => {
  try {
    await Book.destroy({
      where: {
        id: req.body.id,
      },
    });
    return res.send("deleted");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// localhost:3001/admin/book
router.get("/book", isLoggedIn, async (req, res, next) => {
  const query = req.query.title;
  try {
    if (!query) {
      const books = await Book.findAll({});
      res.render("admin/book", {
        title: "도서 목록 | 관리자",
        books,
      });
    } else {
      const books = await Book.findAll({
        where: {
          title: {
            [Op.like]: "%" + query + "%",
          },
        },
      });
      res.render("admin/book", {
        title: "도서 목록 | 관리자",
        books,
      });
    }
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

module.exports = router;
