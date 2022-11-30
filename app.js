const express = require("express");
const path = require("path");
const morgan = require("morgan");
const dotenv = require("dotenv");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const nunjucks = require("nunjucks");
const methodOverride = require('method-override');

dotenv.config();
const pageRouter = require("./routes/page");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const { sequelize } = require("./models");
const passportConfig = require("./passport");

const app = express();
passportConfig();
app.set("port", process.env.PORT || 3001);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: true,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
// HTML form 에서 PUT 요청을 수행하기 위해 method-override 패키지로 가짜 PUT을 생성
app.use(methodOverride('_method'));

app.use("/", pageRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});
