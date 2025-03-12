
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const nunjucks = require('nunjucks');
const cors = require('cors');

var indexRouter = require('./routes/index');//로그인/로그아웃/세션관리
var shopRouter = require('./routes/shop');//상점
var myPageRouter = require('./routes/myPage');//마이페이지


var liveRouter = require('./routes/live');//실시간 채팅

var app = express();

//다른 도메인에서도 api를 쓸수있도록 앱에 cors설정
// const allowedOrigins = ['https://port-0-node-express2-m1gt6wu5bc1fb43d.sel4.cloudtype.app'];
// const allowedOrigins = ['https://port-0-node-express-eu1k2lllm51c76.sel3.cloudtype.app', 'https://222leezieunpofol222.netlify.app'];
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5501'];
const corsOptions = {
    origin: function (origin, callback) {
      // `origin` 값이 허용된 도메인 목록에 포함되어 있는지 확인.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // 허용된 도메인 또는 `origin`이 `null`인 경우
      } else {
        callback(new Error('Not allowed by CORS')); // 허용되지 않은 도메인
      }
    },
    credentials: true, // 요청에 자격 증명(Credentials)을 포함하도록 허용
};
app.use(cors(corsOptions));

app.set('trust proxy', 1);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//라우더설정
app.use('/', indexRouter);
app.use('/myPage',myPageRouter);
app.use('/shop',shopRouter);
app.use('/l', liveRouter);//실시간 라우더설정

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'njk');
nunjucks.configure('views', { 
  express: app,
  watch: true,
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
