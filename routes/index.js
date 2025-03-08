const sqlite3 = require('sqlite3').verbose();
var express = require('express');

//app에서가져온 router
var router = express.Router();

//로그인세션, 데이터를 보내고 가져오기위한 라이브러리들
const passport = require('passport');
const expressSession = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const NaverStrategy = require('passport-naver').Strategy;
const bodyParser = require('body-parser');

const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 설정
const supabaseUrl = 'https://ovmroczkeblnuseyaosj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bXJvY3prZWJsbnVzZXlhb3NqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzg0NzUwMSwiZXhwIjoyMDQzNDIzNTAxfQ.Mt8ncAzt5L2rlGmqNdjmxYAv606J4agH6rDgljlzPKI';
const supabase = createClient(supabaseUrl, supabaseKey);

//고유세션아이디생성을 위한 uuid
const { v4: uuidv4 } = require('uuid');

//세션키 사용,설정
router.use(expressSession(
  { secret: 'your-secret-key', 
  resave: false, 
  saveUninitialized: false ,    
  cookie: {
    // 쿠키 설정 (예: 세션 쿠키의 만료 시간 등)
    maxAge: 60 * 60 * 1000, // 1시간
    httpOnly: true, // HTTP 전용 쿠키로 설정
    secure: process.env.NODE_ENV === "production" ? true : false, //https 적용 시 true
    sameSite: process.env.NODE_ENV === "production" ? "none" : false,
  }
}));
router.use(passport.initialize());
router.use(passport.session());
//json 사용,설정
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json({limit: "100mb"}));


//정규식 값체크
const validator = require('validator');

// 1. 이메일 검증
function validateEmail(email) {
  if (validator.isEmail(email)) {
      return true;
  }
  return false;
}

// 2. 비밀번호 검증 (강력한 비밀번호 기준 적용, 최소 8자 이상)
function validatePassword(password) {
  const regex = /^[가-힣a-zA-Z0-9\s!?@#.,]+$/;
  if (validator.isLength(password, { min: 8, max: 20 }) && regex.test(password)) {
      return true;
  }
  return false;
  // 사용자 정의 강도 검증을 할 수도 있음
  // return validator.isStrongPassword(password, {
  //     minLength: 8
  // });
}

// 4. 짧은 글자 검증 (한글, 영어, 10글자 이하)
function validateShortText(text) {
  const maxLength = 10;
  const regex = /^[가-힣a-zA-Z\s]+$/;
  if (validator.isLength(text, { min: 1, max: maxLength }) && regex.test(text)) {
      return true;
  }
  return false;
}


// Passport.js 로그인 전략 설정
passport.use(new LocalStrategy(
  (username, password, done) => {
    //세션 xx
    let db = new sqlite3.Database('./public/db/custI.db', (err) => {
      if (err) {
          console.error(err.message);
      }
      console.log('Connected to the users database.');
    });

    //데이터베이스에서 사용자 확인
    db.get("SELECT * FROM users WHERE email = ? AND password = ? AND auth != 'N'", [username, password], (err, row) => {
      if (err) {
        console.log('로그인 오류 발생:', err.message);
        return done(null, false);
      }
      if (!row || !validateEmail(username) || !validatePassword(password)) {
        console.log('유효하지 않은 사용자입니다.');
        return done(null, false);
      }
      db.close((closeErr) => {
        if (closeErr) {
          console.error('데이터베이스 연결 종료 중 오류 발생:', closeErr.message);
        }
        return done(null, row);
      });
    });
  }
));



passport.serializeUser(async (user, done) => {
  console.log('.serializeUser');
  done(null, user);
});

passport.deserializeUser((user, done) => {
  if(user.provider == "N"){
    return done(null, user);
  }else{
    let db = new sqlite3.Database('./public/db/custI.db', (err) => {
      if (err) {
          console.error(err.message);
      }
      console.log('Connected to the users database.');
    });

    //데이터베이스에서 사용자 확인
    db.get("SELECT * FROM users WHERE id = ?", [user.id], (err, row) => {
      if (err) {
        console.log('로그인 tlfvo');
        return done(null, false);
      }
      if (!row) {
        console.log('섹션로그인');
        return done(null, false);
      }
      console.log('섹션 로그인 성공');
      return done(null, row);
    });

    db.close((err) => {
      if (err) {
        console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
      } else {
        console.log('데이터베이스 연결이 종료되었습니다.');
      }
    });
  }
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    console.log('미들웨어');
    return next(); // 로그인 상태면 다음 미들웨어로 이동
  }
  res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리디렉션
}

function haveAuthCha(req, res, next) {
  let db = new sqlite3.Database('./public/db/playList.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the users database.');
  });

  //데이터베이스에서 사용자 확인
  db.get("SELECT * FROM userChaList WHERE use = 1 AND userKey = ?", [req.user.key], (err, row) => {
    if (err) {
          console.log(err);
      }
      if (!row) {
        res.redirect('/myPage');
        db.close();
        return
      }else{
        console.log(row.name);
        db.close();
        return next();
      }
  });
}


router.get('/login', function(req, res, next) {
  if (req.isAuthenticated()) {
    req.session.destroy();
  }
  res.render('gpt2.html');
});


router.get('/signUp', function(req, res, next) {
  if (req.isAuthenticated()) {
    req.session.destroy();
  }
  res.render('gSignUp.html');
});

//그냥 로그인
router.post("/login", (req, res, next) => {
  // passport.authenticate()를 사용하여 로그인 처리
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // 로그인 실패 시 실패 리디렉션
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // 로그인 성공 시 성공 리디렉션
      return res.redirect('/myPage');
    });
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

// 저장 설정
const multerProfile = require('multer');
const profileStorage = multerProfile.memoryStorage();

// multer 설정
const upload = multerProfile({
    storage: profileStorage,
    limits: { fileSize: 1 * 1024 * 1024 },
})

//회원가입
router.post('/signUp',upload.single('profileImg'), function (req, res) {
  
});

router.post('/checkPofile', (req, res) => {
  if (req.isAuthenticated() == false) {
    console.log('회원이 아니야?')
    return;
  }else{
    res.send({who:`<div style="margin-left:10px">${req.user.name}님</div>`,whoN: req.user.imgUrl });
  }
})


//내 프로필과 (user) 상품 정보
router.get('/myPage',ensureAuthenticated, (req, res) => {
  res.render('myP.html');
});


//상점페이지
router.get('/shop', ensureAuthenticated,haveAuthCha, (req, res) => {
  res.render('shop.html'); 
});

//관리자 페이지
router.get('/manageGrid', ensureAuthenticated,(req, res) => {
    res.render('manage/crudGrid.html');
});

//캐릭터관리자페이지
router.get('/manageCha', ensureAuthenticated,(req, res) => {
  res.render('manage/manageCha.html');
});


module.exports = router;
