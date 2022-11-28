const passport = require("passport");
const local = require("./localStrategy");
const User = require("../models/user");

module.exports = () => {
  // 로그인 성공 시 req.login 메서드에 의해 호출
  // req.session에 사용자 아이디만 저장
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // 로그인 이후 모든 요청에 대해 passport.session() 미들웨어에 의해 호출됨
  // 조회된 사용자 정보를 req.user에 저장
  passport.deserializeUser((id, done) => {
    User.findOne({ where: { id } })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  local();
};
