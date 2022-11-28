const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const {
  Book,
  Cart,
  CartItem,
  User,
  Card,
  Address,
  Order,
  OrderItem,
  Like,
  Coupon,
  UserCoupon,
  Review,
  sequelize,
} = require("../models");
const { Op, Sequelize, where, fn } = require("sequelize");

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.formatDate = function (date) {
    date.setHours(date.getHours() + 9);
    return date.toISOString().replace("T", " ").substring(0, 19);
  };
  next();
});

router.get("/signup", isNotLoggedIn, (req, res) => {
  res.render("signup", { title: "회원가입" });
});

router.get("/login", isNotLoggedIn, (req, res) => {
  res.render("login", { title: "로그인" });
});

router.post("/reviews/create", isLoggedIn, async (req, res, next) => {
  const { rate, contents, bookId } = req.body;

  const myReview = await Review.findOne({
    where: {
      userId: req.user.id,
      bookId,
    },
  });

  if (myReview) {
    // 내가 이미 작성한 리뷰가 있다면 작성 거부
    res.redirect(`/reviews?bookId=${bookId}&status=denied`);
  } else {
    // 그 외 리뷰를 새로 생성한다.
    const review = await Review.create({
      contents,
      rate: +rate,
      userId: req.user.id,
      bookId: +bookId,
    });

    // 리뷰 생성 완료 시 책의 avgCount를 1 증가, avgRate에 책의 평정 평균 반영
    await Book.increment(
      { countRate: 1 },
      {
        where: {
          id: bookId,
        },
      }
    );

    const book = await Book.findOne({
      raw: true,
      where: {
        id: bookId,
      },
    });

    console.log("---------------새로 작성한 리뷰------------------");
    console.log(review);
    console.log("--------------------책 정보----------------------");
    console.log(book);
    console.log("-------------------------------------------------");

    const { countRate, avgRate } = book;

    Book.update(
      {
        avgRate: fn(
          "ROUND",
          (review.dataValues.rate + (countRate - 1) * avgRate) / countRate,
          2
        ),
      },
      { where: { id: bookId } }
    );

    res.redirect("back");
  }
});

router.get("/reviews", isLoggedIn, async (req, res, next) => {
  const { bookId } = req.query;
  console.log("북아이디", bookId);
  try {
    // "리뷰보기" 버튼을 선택한 책에 대한 리뷰들을 찾음
    const reviews = await Review.findAll({
      raw: true,
      where: {
        bookId: +bookId,
      },
    });

    // 그 책에 대해서 "내"가 작성한 리뷰를 찾음
    const myReview = await Review.findOne({
      raw: true,
      where: {
        userId: req.user.id,
        bookId: +bookId,
      },
    });

    // 평점 및 참여자수를 얻기 위해 책에 대한 정보도 검색
    const book = await Book.findOne({
      raw: true,
      where: {
        id: +bookId,
      },
    });

    console.log("-----------책정보-----------");
    console.log(book);
    console.log("----------리뷰정보----------");
    console.log(reviews);
    console.log("----------------------------");

    res.render("review", {
      title: "리뷰 보기",
      reviews,
      myReview,
      book,
      userId: req.user.id,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/search", isLoggedIn, async (req, res, next) => {
  const query = req.query.bookName;
  if (!query) {
    return res.redirect("/");
  }
  try {
    const books = await Book.findAll({
      raw: true,
      where: {
        title: {
          [Op.like]: "%" + query + "%",
        },
      },
    });

    let results = [];
    for (let i = 0; i < books.length; i++) {
      const like = await Like.findOne({
        raw: true,
        where: {
          bookId: books[i].id,
          userId: req.user.id,
        },
      });

      const reviews = await Review.findAll({
        raw: true,
        where: {
          bookId: books[i].id,
        },
      });

      let reviewResults = [];
      for (let i = 0; i < reviews.length; i++) {
        // 리뷰 ID를
        reviewResults.push(reviews[i].id);
      }
      console.log(reviews);
      results.push([books[i], like, reviewResults]);
    }

    return res.render("main", {
      title: `${query} | 검색 결과`,
      results,
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.post("/likes", isLoggedIn, async (req, res, next) => {
  try {
    const like = await Like.findOne({
      raw: true,
      where: {
        bookId: req.body.bookId,
        userId: req.user.id,
      },
    });

    if (like) {
      await Book.decrement(
        { likes: 1 },
        {
          where: {
            id: req.body.bookId,
          },
        }
      );

      await Like.destroy({
        where: {
          userId: req.user.id,
          bookId: req.body.bookId,
        },
      });
    } else {
      await Book.increment(
        { likes: 1 },
        {
          where: {
            id: req.body.bookId,
          },
        }
      );

      await Like.create({
        userId: req.user.id,
        bookId: req.body.bookId,
      });
    }
    res.send("success");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.delete("/cart", isLoggedIn, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      raw: true,
      where: {
        userId: req.user.id,
      },
    });

    await CartItem.destroy({
      where: {
        id: req.body.selected,
        cartId: cart.id,
      },
    });

    return res.send("deleted");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.post("/cart", isLoggedIn, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      raw: true,
      where: {
        userId: req.user.id,
      },
    });
    console.log(cart);
    const cartItem = await CartItem.findOne({
      where: {
        bookId: req.body.bookId,
        cartId: cart.id,
      },
    });

    if (cartItem && cartItem.count) {
      // 장바구니에 동일 도서가 한 개 이상 있으면 Book 테이블에서 도서를 찾음
      const book = await Book.findOne({
        raw: true,
        where: {
          id: req.body.bookId,
        },
      });

      if (cartItem.count >= book.count) {
        return res.send("fail");
      } else {
        // 현재 장바구니 내의 도서가 재고 이상이 아니라면 count를 1 증가
        CartItem.increment(
          { count: 1 },
          {
            where: {
              id: cartItem.id,
            },
          }
        );
        return res.send("success");
      }
    } else {
      // 아니라면 장바구니에 새로 추가
      CartItem.create({
        cartId: cart.id,
        bookId: req.body.bookId,
      });
      return res.send("success");
    }
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.get("/cart", isLoggedIn, async (req, res, next) => {
  CartItem.findAll({
    attributes: ["id", "count", "createdAt"],
    include: [
      {
        model: Book,
        attributes: [
          "title",
          "authors",
          "publisher",
          "price",
          "thumbnail",
          "count",
        ],
        // 여기에 where문을 추가해야 하는지 테스트해보기
      },
      {
        model: Cart,
        where: {
          userId: req.user.id,
        },
      },
    ],
  })
    .then((results) => {
      res.render("cart", {
        title: "장바구니",
        results,
      });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

router.get("/mypage", isLoggedIn, async (req, res, next) => {
  const orders = await Order.findAll({
    attributes: ["id", "createdAt", "totalCount", "totalPrice", "usedPoint"],
    where: {
      userId: req.user.id,
    },
  });

  const user = await User.findOne({
    raw: true,
    where: {
      id: req.user.id,
    },
  });

  const userCoupons = await UserCoupon.findAll({
    include: {
      model: Coupon,
      attributes: ["name", "description"],
    },
    where: {
      userId: req.user.id,
    },
  });

  res.render("mypage", {
    title: "마이페이지",
    user,
    userCoupons,
    orders,
  });
});

router.post("/address", isLoggedIn, async (req, res, next) => {
  const { zipCode, address, detailAddress } = req.body;
  try {
    if (!zipCode) {
      const msg = encodeURIComponent("주소가 입력되지 않았습니다.");
      return res.redirect(`/address?error=${msg}`);
    }
    await Address.create({
      zipCode,
      address,
      detailAddress,
      userId: req.user.id,
    });
    res.redirect("/address");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.get("/address", isLoggedIn, async (req, res, next) => {
  Address.findAll({
    attributes: ["id", "zipCode", "address", "detailAddress"],
    where: {
      userId: req.user.id,
    },
  })
    .then((results) => {
      res.render("address", {
        title: "주소 선택",
        results,
      });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

router.delete("/address", isLoggedIn, async (req, res, next) => {
  try {
    await Address.destroy({
      where: {
        id: req.body.addrId,
      },
    });
    return res.send("success");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.post("/card", isLoggedIn, async (req, res, next) => {
  const { number, expirationDate, company } = req.body;
  try {
    if (!(number && expirationDate && company)) {
      const msg = encodeURIComponent("카드가 입력되지 않았습니다.");
      return res.redirect(`/card?error=${msg}`);
    }
    await Card.create({
      number,
      expirationDate,
      company,
      userId: req.user.id,
    });
    res.redirect("/card");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.get("/card", isLoggedIn, async (req, res, next) => {
  Card.findAll({
    attributes: ["number", "expirationDate", "company"],
    where: {
      userId: req.user.id,
    },
  })
    .then((results) => {
      res.render("card", {
        title: "카드 선택",
        results,
      });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

router.delete("/card", isLoggedIn, async (req, res, next) => {
  try {
    await Card.destroy({
      where: {
        number: req.body.cardNumber,
      },
    });
    return res.send("success");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.post("/purchase/result", isLoggedIn, async (req, res, next) => {
  const {
    zipCode,
    address,
    detailAddress,
    number,
    expirationDate,
    company,
    totalCount,
    totalPrice,
    bookId,
    bookCount,
    isCart,
    stamp,
    currentPoint,
    point,
  } = req.body;
  const bookIds = bookId.split(",").map((v) => Number(v));
  const bookCounts = bookCount.split(",").map((v) => Number(v));

  const resultPoint = (Number(totalPrice) - point) * 0.1;
  let usedStamp = 0;

  try {
    // 적립금을 사용했다면 (조건: 스탬프 10개 이상)
    if (point > 0) {
      await User.decrement(
        {
          stamp: 10,
          point,
        },
        {
          where: {
            id: req.user.id,
          },
        }
      );

      // 사용한 스탬프 10개는 usedStamp에 반영
      usedStamp = 10;
    }
    // 구매 후 stamp 및 point 적용
    await User.increment(
      {
        stamp: Number(totalCount),
        point: resultPoint,
      },
      {
        where: {
          id: req.user.id,
        },
      }
    );

    const order = await Order.create({
      totalCount: +totalCount,
      totalPrice: +totalPrice,
      zipCode,
      address,
      detailAddress,
      cardNumber: number,
      cardExpDate: expirationDate,
      cardCompany: company,
      userId: req.user.id,
      usedPoint: point,
      usedStamp,
    });

    // 사용자의 그동안의 결제금액에 이번 주문에서 발생한 결제금액을 추가
    await User.increment(
      {
        totalPrice: order.dataValues.totalPrice - order.dataValues.usedPoint,
      },
      {
        where: {
          id: req.user.id,
        },
      }
    );

    // 사용자의 총 결제금액이 다음 등급의 기준치를 만족하면 승급 및 쿠폰 발급
    const now = Date.now();

    if (req.user.totalPrice >= 100000 && req.user.grade === 'BRONZE') {
      await User.update(
        { grade: "SILVER" },
        {
          where: {
            id: req.user.id,
          },
        }
      );
      await UserCoupon.create({
        extinctionDate: new Date(now.setMonth(now.getMonth() + 1)),
        status: true,
        couponId: 3,
        userId: req.user.id,
      });
    } else if (req.user.totalPrice >= 300000 && req.user.grade === 'SILVER') {
      await User.update(
        { grade: "GOLD" },
        {
          where: {
            id: req.user.id,
          },
        }
      );
      await UserCoupon.create({
        extinctionDate: new Date(now.setMonth(now.getMonth() + 1)),
        status: true,
        couponId: 4,
        userId: req.user.id,
      });
    } else if (req.user.totalPrice >= 500000 && req.user.grade === 'GOLD') {
      await User.update(
        { grade: "PLATINUM" },
        {
          where: {
            id: req.user.id,
          },
        }
      );
      await UserCoupon.create({
        extinctionDate: new Date(now.setMonth(now.getMonth() + 1)),
        status: true,
        couponId: 5,
        userId: req.user.id,
      });
    } else if (req.user.totalPrice >= 1000000 && req.user.grade === 'PLATINUM') {
      await User.update(
        { grade: "DIAMOND" },
        {
          where: {
            id: req.user.id,
          },
        }
      );
      await UserCoupon.create({
        extinctionDate: new Date(now.setMonth(now.getMonth() + 1)),
        status: true,
        couponId: 6,
        userId: req.user.id,
      });
    }

    for (let i = 0; i < bookIds.length; i++) {
      const orderItem = await OrderItem.create({
        count: bookCounts[i],
        bookId: bookIds[i],
        orderId: order.dataValues.id,
      });

      // 구매한 수량만큼 책 수량 감소
      Book.decrement(
        {
          count: orderItem.dataValues.count,
        },
        {
          where: {
            id: bookIds[i],
          },
        }
      );
    }

    // 장바구니에서 구매한 경우 장바구니 내역을 비운다.
    if (isCart === "Y") {
      const cart = await Cart.findOne({
        raw: true,
        where: {
          userId: req.user.id,
        },
      });

      await CartItem.destroy({
        where: {
          cartId: cart.id,
          bookId: bookIds,
        },
      });
    }

    // 주문 완료 시 마이페이지로 이동
    res.redirect("/mypage?status=success");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/purchase/withdraw", isLoggedIn, async (req, res, next) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findOne({
      raw: true,
      where: {
        id: orderId,
      },
    });
    console.log(order);

    // 사용자가 "사용한" 적립금 및 스탬프 복구
    await User.increment(
      {
        stamp: order.usedStamp,
        point: order.usedPoint,
      },
      {
        where: {
          id: req.user.id,
        },
      }
    );

    // 사용자에게 "적립된" 적립금 및 스탬프 삭제
    await User.decrement(
      {
        stamp: order.totalCount,
        point: (Number(order.totalPrice) - Number(order.usedPoint)) * 0.1,
      },
      {
        where: {
          id: req.user.id,
        },
      }
    );

    // 주문내역 삭제
    await OrderItem.destroy({
      where: {
        orderId,
      },
    });

    await Order.destroy({
      where: {
        id: orderId,
      },
    });

    res.redirect("/mypage?status=success");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 수정해야 할 부분
router.get("/purchase/detail", isLoggedIn, async (req, res, next) => {
  const { orderId } = req.query;
  const results = [];

  try {
    const order = await Order.findOne({
      raw: true,
      where: {
        id: orderId,
      },
    });
    console.log(order);

    const orderItems = await OrderItem.findAll({
      raw: true,
      where: {
        orderId,
      },
    });

    for (let i = 0; i < orderItems.length; i++) {
      const book = await Book.findOne({
        raw: true,
        where: {
          id: orderItems[i].bookId,
        },
      });
      results.push([orderItems[i], book]);
    }

    console.log("results", results);
    res.render("detail", {
      title: "상세정보",
      order,
      results,
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.post("/purchase", isLoggedIn, async (req, res, next) => {
  // 바로구매의 경우
  if (req.body.bookId) {
    req.session.isCart = "N";

    Book.findOne({
      raw: true,
      attributes: ["id", "title", "price", "thumbnail"],
      where: {
        id: req.body.bookId,
      },
    })
      .then((result) => {
        const results = [];
        result.count = 1;
        results.push(result);
        // GET /purchase 할 때 전송할 데이터를
        // req.session에 담아 전송
        req.session.results = results;
        res.redirect("/purchase");
      })
      .catch((err) => {
        console.error(err);
        return next(err);
      });
  }
  // 장바구니에서 구매하는 경우
  if (req.body.selected) {
    req.session.isCart = "Y";

    const cart = await Cart.findOne({
      raw: true,
      where: {
        userId: req.user.id,
      },
    });

    // 장바구니에서 선택한 수량대로 cartItem update
    for (let i = 0; i < req.body.selected.length; i++) {
      await CartItem.update(
        {
          count: req.body.counts[i],
        },
        {
          where: {
            id: req.body.selected[i],
          },
        }
      );
    }

    Book.findAll({
      raw: true,
      attributes: ["id", "title", "price", "thumbnail"],
      include: {
        model: CartItem,
        attributes: ["id", "count"],
        where: {
          id: req.body.selected,
          cartId: cart.id,
        },
      },
    })
      .then((results) => {
        console.log("---------------------------------------");
        console.log(results);
        console.log("---------------------------------------");
        results.forEach((result) => {
          // "CartItems.id/CartItem.count"는 nunjucks에서 받을 수 없음
          // .(dot)으로 속성을 받을 수 있도록 재정의
          result.cartId = result["CartItems.id"];
          result.count = result["CartItems.count"];
        });
        req.session.results = results;
        res.redirect("/purchase");
      })
      .catch((err) => {
        console.error(err);
        return next(err);
      });
  }
});

router.get("/purchase", isLoggedIn, async (req, res, next) => {
  const { results, isCart } = req.session;

  const userCoupons = await UserCoupon.findAll({
    raw: true,
    where: {
      userId: req.user.id,
    },
  });

  console.log(userCoupons);
  let coupons = [];
  for (let i = 0; i < userCoupons.length; i++) {
    const coupon = await Coupon.findOne({
      raw: true,
      where: {
        id: userCoupons[i].couponId,
      },
    });
    coupons.push(coupon);
  }
  console.log(coupons);

  res.render("purchase", {
    title: "주문하기",
    results,
    coupons,
    isCart,
    stamp: req.user.stamp,
    point: req.user.point,
  });
});

router.get("/", (req, res) => {
  if (req.user?.grade === "ADMIN") {
    res.render("admin/main", {
      title: "관리자 페이지",
    });
  } else {
    res.render("main", {
      title: "도서 구매 사이트",
    });
  }
});

module.exports = router;
