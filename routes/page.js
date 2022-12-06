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
const { Op, fn } = require("sequelize");

const router = express.Router();

// 공통 라우터 : 사용자 정보 및 날짜 포맷 함수를 res.locals에 저장

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.formatDate = function (date) {
    date.setHours(date.getHours() + 9);
    return date.toISOString().replace("T", " ").substring(0, 19);
  };
  next();
});

// 회원가입 페이지 렌더링 라우터

router.get("/signup", isNotLoggedIn, (req, res) => {
  res.render("signup", { title: "회원가입" });
});

// 로그인 페이지 렌더링 라우터

router.get("/login", isNotLoggedIn, (req, res) => {
  res.render("login", { title: "로그인" });
});

// 리뷰 수정 라우터 (review.html 에서 수정하기 버튼 클릭)

router.put("/reviews", isLoggedIn, async (req, res, next) => {
  const { rate, prevRate, contents, bookId } = req.body;

  await Review.update(
    {
      rate: +rate,
      contents,
    },
    {
      where: {
        userId: req.user.id,
        bookId: +bookId,
      },
    }
  );

  const book = await Book.findOne({
    raw: true,
    where: {
      id: bookId,
    },
  });

  const { countRate, avgRate } = book;

  // 변경된 점수를 반영하여 평점 업데이트
  Book.update(
    {
      avgRate: fn(
        "ROUND",
        (avgRate * countRate - +prevRate + +rate) / countRate,
        2
      ),
    },
    { where: { id: bookId } }
  );

  res.redirect("back");
});

// 리뷰 작성 라우터 (review.html에서 작성 버튼 클릭)

router.post("/reviews", isLoggedIn, async (req, res, next) => {
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
    // 그 외의 경우 리뷰를 새로 생성한다.
    const review = await Review.create({
      contents,
      rate: +rate,
      userId: req.user.id,
      bookId: +bookId,
    });

    // 리뷰 생성 완료 시 책의 avgCount를 1 증가, avgRate에 책의 평점 반영
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

    // 책에서 참여자수, 평점을 가져와 이를 토대로 평점 반영
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

// 리뷰보기 페이지 렌더링 라우터

router.get("/reviews", isLoggedIn, async (req, res, next) => {
  const { bookId } = req.query;
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

// 책 검색 시 나오는 검색결과 페이지 렌더링 라우터

router.get("/search", isLoggedIn, async (req, res, next) => {
  const query = req.query.bookName;

  // 검색 결과가 없을 시 메인페이지로 이동
  if (!query) {
    return res.redirect("/");
  }
  try {
    // 도서명이 키워드를 포함하는 도서를 검색
    const books = await Book.findAll({
      raw: true,
      where: {
        title: {
          [Op.like]: "%" + query + "%",
        },
      },
    });

    let results = [];

    // 각 도서에 대한 좋아요와 리뷰를 검색
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
        reviewResults.push(reviews[i].id);
      }
      // 책과 그 책에 대한 좋아요, 리뷰들을 results에 push (검색된 책 개수만큼 반복)
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

// 좋아요 버튼 누를 때 실행되는 라우터

router.post("/likes", isLoggedIn, async (req, res, next) => {
  try {
    const like = await Like.findOne({
      raw: true,
      where: {
        bookId: req.body.bookId,
        userId: req.user.id,
      },
    });

    // 이미 좋아요 버튼이 눌러져 있다면 좋아요 취소
    // 안눌러져 있으면 좋아요
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

// 장바구니 내 선택한 도서를 삭제하는 버튼을 클릭했을 때 실행되는 라우터

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

// 장바구니에서 구매하기 버튼을 클릭했을 때 변경된 개수를 반영하는 라우터

router.put("/cart", isLoggedIn, async (req, res, next) => {
  const { selected, counts } = req.body;
  try {
    for (let i = 0; i < selected.length; i++) {
      await CartItem.update(
        {
          count: counts[i],
        },
        {
          where: {
            id: selected[i],
          },
        }
      );
    }

    res.send("success");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// 검색 결과에서 장바구니 버튼을 클릭했을 때 실행되는 라우터

router.post("/cart", isLoggedIn, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      raw: true,
      where: {
        userId: req.user.id,
      },
    });

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
        // 장바구니 내 도서가 현재 도서의 재고 이상이라면 실패 처리
        return res.send("fail");
      } else {
        // 그렇지 않으면 cartItem의 count를 1 증가
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

// 장바구니 페이지 렌더링 라우터

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

// 마이페이지 렌더링 라우터

router.get("/mypage", isLoggedIn, async (req, res, next) => {
  // 이름, 등급, 포인트, 스탬프를 찾음
  const user = await User.findOne({
    raw: true,
    where: {
      id: req.user.id,
    },
  });

  // 현재 보유중인 쿠폰 정보를 찾음
  const userCoupons = await UserCoupon.findAll({
    include: {
      model: Coupon,
      attributes: ["name", "description"],
    },
    where: {
      userId: req.user.id,
    },
  });

  // user의 주문내역을 찾음
  const orders = await Order.findAll({
    attributes: [
      "id",
      "createdAt",
      "totalCount",
      "initialPrice",
      "finalPrice",
      "usedPoint",
    ],
    where: {
      userId: req.user.id,
    },
  });

  res.render("mypage", {
    title: "마이페이지",
    user,
    userCoupons,
    orders,
    condition:
      user.grade === "BRONZE"
        ? 50000
        : user.grade === "SILVER"
        ? 100000
        : user.grade === "GOLD"
        ? 300000
        : 500000,
  });
});

// 주소 선택 창에서 "새 주소 등록" 버튼을 누를 때 실행되는 라우터

router.post("/address", isLoggedIn, async (req, res, next) => {
  const { zipCode, address, detailAddress } = req.body;
  try {
    await Address.create({
      zipCode,
      address,
      detailAddress,
      userId: req.user.id,
    });
    res.status(201).redirect("/address");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// 주소 선택 창 렌더링 라우터

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
      return next(err);
    });
});

// 주소 선택 창에서 deleteAddr를 누를 때 실행되는 라우터

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

// 주소 선택 창에서 onClickCardBtn을 누를 때 실행되는 라우터

router.post("/card", isLoggedIn, async (req, res, next) => {
  const { number, expirationDate, company } = req.body;
  try {
    const existCard = await Card.findByPk(number);

    if (existCard) {
      res.status(409).send("existed");
    } else {
      await Card.create({
        number,
        expirationDate,
        company,
        userId: req.user.id,
      });

      res.status(201).redirect("/card");
    }
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// 카드 선택 창 렌더링 라우터

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
      return next(err);
    });
});

// // 주소 선택 창에서 deleteCard를 누를 때 실행되는 라우터

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

router.get("/coupon", isLoggedIn, async (req, res, next) => {
  try {
    // 유효기간이 지나지 않은 쿠폰만 검색
    const userCoupons = await UserCoupon.findAll({
      raw: true,
      attributes: ["couponId"],
      where: {
        extinctionDate: { [Op.gt]: new Date() },
        userId: req.user.id,
      },
    });

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
    console.log("-----------사용가능한 쿠폰-------------");
    console.log(coupons);
    console.log("---------------------------------------");

    res.render("coupon", {
      title: "쿠폰 선택",
      coupons,
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// 결제 창에서 구매하기 버튼을 눌렀을 때 실행되는 라우터

router.post("/purchase/result", isLoggedIn, async (req, res, next) => {
  const {
    zipCode,
    address,
    detailAddress,
    number,
    expirationDate,
    company,
    totalCount,
    initialPrice,
    finalPrice,
    bookId,
    bookCount,
    status,
    couponId,
    point,
  } = req.body;

  // 문자열로 저장되어 있는 도서 코드와 수량을 배열로 split해 저장
  const bookIds = bookId.split(",").map((v) => Number(v));
  const bookCounts = bookCount.split(",").map((v) => Number(v));

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
    // 포인트는 실결제금액(포인트 및 쿠폰이 적용된 금액)의 10% 적립
    await User.increment(
      {
        stamp: +totalCount,
        point: Math.round(finalPrice * 0.1),
      },
      {
        where: {
          id: req.user.id,
        },
      }
    );

    // Order 테이블의 couponId는 userCoupon의 id를 사용한다. (주문취소 시 복구하기 위해서)
    const usedCoupon = await UserCoupon.findOne({
      raw: true,
      where: {
        userId: req.user.id,
        couponId: +couponId,
      },
    });

    // 주문내역 생성
    const order = await Order.create({
      totalCount: +totalCount,
      initialPrice: +initialPrice,
      finalPrice: +finalPrice,
      zipCode,
      address,
      detailAddress,
      cardNumber: number,
      cardExpDate: expirationDate,
      cardCompany: company,
      userId: req.user.id,
      couponId: usedCoupon?.id ?? null,
      usedPoint: point,
      usedStamp,
    });

    // 사용한 쿠폰이 있다면 삭제
    if (usedCoupon) {
      await UserCoupon.destroy({
        where: {
          id: usedCoupon.id,
        },
      });
    }

    // 사용자의 그동안의 결제금액에 이번 주문에서 발생한 실결제금액을 추가
    await User.increment(
      {
        totalPrice: +finalPrice,
      },
      {
        where: {
          id: req.user.id,
        },
      }
    );

    // 현재 방식: 사용자의 총 결제금액이 다음 등급의 기준치를 만족하면 승급 및 쿠폰 발급
    // 문제점: 한꺼번에 10만원 이상 구매 시 bronze->gold가 되어 sliver 혜택을 받지 못하는 현상 발생

    // 나중에 매 달마다 등급에 따른 쿠폰 지급으로 수정하려면 node-cron 모듈을 사용한다.
    // 월별 등급에 따른 쿠폰 지급 후 모든 user의 totalPrice를 0으로 초기화 (일반적인 쇼핑몰 방식)
    const now = new Date();

    const user = await User.findOne({
      raw: true,
      attributes: ["totalPrice", "grade"],
      where: {
        id: req.user.id,
      },
    });

    if (
      user.totalPrice >= 50000 &&
      user.totalPrice < 100000 &&
      user.grade === "BRONZE"
    ) {
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
        couponId: 3,
        userId: req.user.id,
      });
    } else if (
      user.totalPrice >= 100000 &&
      user.totalPrice < 300000 &&
      user.grade === "SILVER"
    ) {
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
        couponId: 4,
        userId: req.user.id,
      });
    } else if (
      user.totalPrice >= 300000 &&
      user.totalPrice < 500000 &&
      user.grade === "GOLD"
    ) {
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
        couponId: 5,
        userId: req.user.id,
      });
    } else if (user.totalPrice >= 500000 && user.grade === "PLATINUM") {
      await User.update({ grade: "DIAMOND" }, { where: { id: req.user.id } });
      await UserCoupon.create({
        extinctionDate: new Date(now.setMonth(now.getMonth() + 1)),
        couponId: 6,
        userId: req.user.id,
      });
    }

    // 주문내역에 들어가는 도서 정보를 담을 OrderItem 생성
    for (let i = 0; i < bookIds.length; i++) {
      const orderItem = await OrderItem.create({
        count: bookCounts[i],
        bookId: bookIds[i],
        orderId: order.dataValues.id,
      });

      // 구매한 수량만큼 책 수량 감소
      Book.decrement(
        { count: orderItem.dataValues.count },
        { where: { id: bookIds[i] } }
      );
    }

    // 장바구니에서 구매한 경우 장바구니 내역을 비운다.
    if (status === "C") {
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

// 마이페이지에서 주문취소 버튼 클릭 시 실행되는 라우터

router.post("/purchase/withdraw", isLoggedIn, async (req, res, next) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findOne({
      raw: true,
      where: {
        id: orderId,
      },
    });

    const orderItems = await OrderItem.findAll({
      raw: true,
      where: {
        orderId,
      },
    });

    // 책 남은 수량 복구
    for (let i = 0; i < orderItems.length; i++) {
      await Book.increment(
        { count: orderItems[i].count },
        {
          where: {
            id: orderItems[i].bookId,
          },
        }
      );
    }

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

    const usedCoupon = await UserCoupon.findOne({
      where: {
        id: order.couponId,
      },
      paranoid: false,
    });

    // 쿠폰 적용 시 삭제되었던 사용자 쿠폰을 복구 (쿠폰을 사용하였다면)
    if (usedCoupon) {
      usedCoupon.restore();
    }

    // 사용자에게 "적립된" 적립금 및 스탬프, 총 구매금액 삭제
    await User.decrement(
      {
        stamp: order.totalCount,
        point: Math.round(order.finalPrice * 0.1),
        totalPrice: order.finalPrice,
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

    // 주문정보 삭제
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

// 마이페이지에서 상세보기 버튼 클릭 시 실행되는 라우터

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

// 구매페이지 렌더링 라우터

router.get("/purchase", isLoggedIn, async (req, res, next) => {
  // html에서 for문으로 표현하기 위해 results 배열에 담아 전송
  const results = [];

  const { bookId, selected } = req.query;
  let status; // 장바구니에서 구매했으면 'C', 바로구매이면 'N'

  // 바로구매하는 경우
  if (bookId) {
    status = "N";

    await Book.findOne({
      raw: true,
      attributes: ["id", "title", "price", "thumbnail"],
      where: {
        id: +req.query.bookId,
      },
    })
      .then((book) => {
        book.count = 1;
        results.push(book);
      })
      .catch((err) => {
        console.error(err);
        return next(err);
      });
  }
  // 장바구니에서 구매하는 경우
  if (selected) {
    status = "C";

    const cart = await Cart.findOne({
      raw: true,
      where: {
        userId: req.user.id,
      },
    });

    await Book.findAll({
      raw: true,
      attributes: ["id", "title", "price", "thumbnail"],
      include: {
        model: CartItem,
        attributes: ["count"],
        where: {
          id: selected.split(",").map((v) => Number(v)),
          cartId: cart.id,
        },
      },
    })
      .then((books) => {
        books.forEach((book) => {
          book.count = book["CartItems.count"];
          delete book["CartItems.count"];
          results.push(book);
        });
        console.log("-------------구매 책 정보----------------");
        console.log(books);
        console.log("-----------------------------------------");
      })
      .catch((err) => {
        console.error(err);
        return next(err);
      });
  }

  console.log("---------------결과----------------");
  console.log(results);
  console.log("-----------------------------------");

  res.render("purchase", {
    title: "주문하기",
    results,
    stamp: req.user.stamp,
    point: req.user.point,
    status,
  });
});

// 메인페이지 렌더링 라우터 (관리자/일반)

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
