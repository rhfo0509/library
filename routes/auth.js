const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const User = require("../models/user");
const { Cart, Coupon, UserCoupon } = require("../models");
const { Op } = require("sequelize");

const router = express.Router();

// localhost:3001/auth/signup
router.post("/signup", isNotLoggedIn, async (req, res, next) => {
  const { id, password, name } = req.body;
  try {
    const exUser = await User.findOne({ where: { id } });
    if (exUser) {
      return res.redirect("/signup?error=exist");
    }
    const hash = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      id,
      password: hash,
      name,
    });

    // 신규가입 쿠폰, 브론즈 등급 쿠폰 발급 (유효기간 1달)
    const now = new Date();

    // 유저에게 발급 전 쿠폰 테이블에 존재하는지 확인
    const coupons = await Coupon.findAll({
      raw: true,
      where: {
        id: {[Op.in]: [1, 2]},
      }
    });

    if (coupons.length === 2) {
      await UserCoupon.create({
        extinctionDate: new Date(now.setMonth(now.getMonth() + 1)),
        status: true,
        couponId: 1,
        userId: newUser.id,
      })
  
      await UserCoupon.create({
        extinctionDate: new Date(now.setMonth(now.getMonth())),
        status: true,
        couponId: 2,
        userId: newUser.id,
      })
    }

    await Cart.create({
      userId: newUser.id,
    });
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

// localhost:3001/auth/login
router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect("/");
    });
  })(req, res, next);
});

router.get("/logout", isLoggedIn, (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    req.session.destroy();
    res.redirect("/");
  });
});

module.exports = router;
