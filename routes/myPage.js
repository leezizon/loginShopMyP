var express = require('express');
const sqlite3 = require('sqlite3').verbose();
var router = express.Router();
const multerProfile = require('multer');

const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 설정
const supabaseUrl = 'https://ovmroczkeblnuseyaosj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bXJvY3prZWJsbnVzZXlhb3NqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzg0NzUwMSwiZXhwIjoyMDQzNDIzNTAxfQ.Mt8ncAzt5L2rlGmqNdjmxYAv606J4agH6rDgljlzPKI';
const supabase = createClient(supabaseUrl, supabaseKey);

//정규식 설정
const validator = require('validator');

// 3. 긴 글자 검증 (한글, 영어, 100글자 이하)
function validateLongText(text) {
  const maxLength = 100;
  // 특수문자는 제외하고, 한글, 영어, 공백을 포함한 문자만 허용
  const regex = /^[가-힣a-zA-Z0-9\s!?.,]+$/;
  if (validator.isLength(text, { min: 1, max: maxLength }) && regex.test(text)) {
      return true;
  }
  return false;
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


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      console.log('미들웨어');
      return next(); // 로그인 상태면 다음 미들웨어로 이동
    }
    res.redirect('/./login'); // 로그인되지 않은 경우 로그인 페이지로 리디렉션
}

router.get('/myPagePd',ensureAuthenticated, (req, res) => {
  let query = 'SELECT * FROM user_M WHERE userKey = ?';

  let db = new sqlite3.Database('./public/db/shop.db', (err) => {
    if (err) {
        console.error(err.message);
    }
  });

  let db2 = new sqlite3.Database('./public/db/playList.db', (err) => {
    if (err) {
        console.error(err.message);
    }
  });


  db.all(query ,[req.user.key], (err, rows1) => {
    db2.all('SELECT * FROM userChaList WHERE userKey = ?',[req.user.key], (err, rows3) => {
      let chaHtml = '';
      rows3.forEach((row,idx) => {
        chaHtml += `
          <div class="${row.use==0?'chaList':'chaListUse'}" onclick="chaListGallery(${idx})">
            <div class="chaListImg" id="${row.key}"></div>
            <div class="chaListNm">${row.name}</div>
          </div>`
      });

      const useCha =  rows3.find(item => item.use === 1);

      if(!useCha){
        db.close();
        db2.close();
        res.send({ch:chaHtml, pd : '캐릭터가 없어요', chaId: req.user.id, name:req.user.name, email:req.user.email, intro:req.user.introduction});
        return
      };


      db.all('SELECT * FROM assets WHERE assetsWithUserId = ? AND chaKey = ?' ,[req.user.key, useCha.key], (err, rows2) => {
        if (err) {
          console.error("Database error:", err);
          return;
        }
        let tableHtml = '';
        if(rows2){
          rows2.forEach((row) => {
            tableHtml += `
            <section class="product">
              <div style="margin-right:20px">
                <img src="https://dancing-kataifi-ac965e.netlify.app/shop/${row.worldKey}/product/${row.PdId}.png" alt="상품 이미지">
              </div>
              <div class="product-details">
                <h2>${row.PdNm}</h2>
                <p>상품설명상품설명상품설명상품설명상품설명상품설명상품설명.</p>
              </div>
            </section>`
          });
        }

        res.send({ch:chaHtml, pd : tableHtml, chaId: req.user.id, name:req.user.name, email:req.user.email, intro:req.user.introduction});
      
        db.close((err) => {
          if (err) {
            console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
          } else {
            console.log('데이터베이스 연결이 종료되었습니다.');
          }
        });
        db2.close((err) => {
          if (err) {
            console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
          } else {
            console.log('데이터베이스 연결이 종료되었습니다.');
          }
        });

        return
      })
    })
  })

})

module.exports = router;