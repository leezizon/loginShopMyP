var express = require('express');
const sqlite3 = require('sqlite3').verbose();
var router = express.Router();

//상품
router.get('/leePd2', function(req, res, next) {
  
    const param1 = req.query.param1;
    const param2 = req.query.param2;
  
    let dbIndex = 0;
    let db = new sqlite3.Database('./public/db/shop.db', (err) => {
      if (err) {
          console.error(err.message);
      }
    });
    
    db.all('SELECT * FROM product WHERE worldKey = ? LIMIT 6 OFFSET ?',[param2,param1], (err, rows) => {
      if (err) {
        return res.send('데이터베이스에서 정보를 가져오지 못했습니다.');
      }
  
      // HTML 표 생성
      let tableHtml = '';
      
      // tableHtml += `<div class="horizontal-line"></div>`
  
      rows.forEach((row) => {
        dbIndex += 1;
        tableHtml += 
        `<section class="product" id="Pd${row.PdId}">
        <div class="product-detail"><div class="HiddenPd">${row.PdNm}</div><img src="https://dancing-kataifi-ac965e.netlify.app/shop/${row.worldKey}/product/${row.PdId}.png" alt="상품 이미지"></div>     
        <div class = "custom-buttons">
        <div class="MHiddenPd">${row.PdNm}</div>
        <div class="MHiddenPd">${row.PdEx}</div>
        <button id="getPdEx${row.PdId}"  class="custom-button2"><input type="hidden" class="hiddenField" value="${row.PdEx}">설명</button>
        <button id="getPd${row.PdId}"  class="custom-button"><input type="hidden" class="hiddenField" value="${row.PdPrice}원">${row.PdPrice}</button>
        </div>
        </section>`
        // if(dbIndex == 3){
        //   tableHtml += `<div class="horizontal-line"></div>`
        // } 
      });
  
      // tableHtml += `<div class="horizontal-line"></div>`
  
      // 렌더링된 HTML을 클라이언트로 보냄
      res.send(tableHtml);
  
      //close the database connection
      db.close((err) => {
        if (err) {
          console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
        } else {
          console.log('데이터베이스 연결이 종료되었습니다.');
        }
      });
    });
  });
  
//이름, 자산정보만 빼오기
  router.get('/inShopMyMoney', (req, res) => {
    console.log('내상품정보2');
  
    if (req.isAuthenticated() == false) {
      console.log('로그인해주세요');
      return;
    }
  
    let query = 'SELECT userChaList.name, chaM.Money FROM userChaList JOIN chaM ON userChaList.key = chaM.chaKey WHERE userChaList.userKey = ? AND userChaList.use = 1';
    // let query = 'SELECT * FROM user_M WHERE userKey = ?';
    if(req.user.provider == "N"){
      query = 'SELECT * FROM user_M WHERE userKey = ?'
    }
  
    let db = new sqlite3.Database('./public/db/playList.db', (err) => {
      if (err) {
          console.error(err.message);
      }
    });
  
    db.all(query ,[req.user.key], (err, rows) => {
  
    res.send({name:req.user.name, money:rows[0].Money});
  
    })
  
    db.close((err) => {
      if (err) {
        console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
      } else {
        console.log('데이터베이스 연결이 종료되었습니다.');
      }
    });
  })

  //상품구매
  router.post('/save', function(req, res) {
    if (req.isAuthenticated() == false) {
      console.log('로그인해주세요');
      res.json('F');
      return;
    }

    var b_product_id = req.body.PdId;
  
    if (Array.isArray(b_product_id)) {
      console.log('이 변수는 배열입니다.');
    } else {
      b_product_id = [b_product_id];
    }
  
    var b_product_cost = 100000; 
    var b_product_cnt = 100000; 
    var b_product_nm = ''; 
  
   let db = new sqlite3.Database('./public/db/shop.db', (err) => {
      if (err) {
          console.error(err.message);
      }
    });

    let dbCha = new sqlite3.Database('./public/db/playList.db', (err) => {
      if (err) {
          console.error(err.message);
      }
    });
  
    async function processProducts(req, res) {
      try {
        const cha = await getCha(req.user.key);
        const chaMoney = await getChaM(cha.key);

        //업데이트할 변수들(유저 자산, 재고상황)
        let updatedUserMoney = chaMoney;
        let updatedProductCnt;
  
        for (let i = 0; i < b_product_id.length; i++) {
          const productRows = await getProductData(parseInt(b_product_id[i].pdId));
  
          if (productRows.length > 0) {
            const row = productRows[0];
            b_product_cost = row.PdPrice;
            b_product_cnt = row.PdCnt;
            b_product_nm = row.PdNm;
  
            if ( chaMoney >= b_product_cost) {
              updatedProductCnt = b_product_cnt - parseInt(b_product_id[i].count);
              updatedUserMoney = updatedUserMoney - b_product_cost*parseInt(b_product_id[i].count);
              await PD_U_A_D(req.user.key, parseInt(b_product_id[i].pdId), updatedProductCnt, b_product_nm, updatedUserMoney, cha.name, parseInt(b_product_id[i].count),req.body.world,cha.key);
            } else {
              res.json('N');
              return;
            }
          }
        }
  
        await shutDb();
        res.json('T');
      } catch (error) {
        await shutDb();
        res.json('F');
        console.error(error);
      }
    }
  
    // 캐릭터 정보 조회
    function getCha(userId) {
      return new Promise((resolve, reject) => {
        dbCha.get('SELECT * FROM userChaList WHERE userKey = ? AND use = 1', [userId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
      });
    }
  
    // 유저 정보 조회
    function getChaM(cha) {
      console.log(cha);
      return new Promise((resolve, reject) => {
        dbCha.get('SELECT * FROM chaM WHERE chaKey = ?', [cha], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.Money);
          }
        });
      });
    }
  
    // 상품 정보 조회
    function getProductData(productId) {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM product WHERE PdId = ?', [productId], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }
  
    // db 업데이트 인서트
    async function PD_U_A_D(id, b_pd_id, b_pd_cnt, b_pd_nm, f_m, user_name, toBuyProductCount,world,chaKey) {
      await updateProduct(id, b_pd_id, b_pd_cnt);
      await updateUserMoney(id, f_m, chaKey);
      await insertAssets(id, b_pd_nm, b_pd_id, 'Y', user_name, toBuyProductCount,world,chaKey);
    }
  
    // 상품 정보 업데이트
    function updateProduct(id, b_pd_id, b_pd_cnt) {
      return new Promise((resolve, reject) => {
        db.run('UPDATE product SET PdCnt = ? WHERE PdId = ?', [b_pd_cnt, b_pd_id], function (err) {
          if (err) {
            reject(err);
          } else {
            console.log(`Product Updated: ${this.changes} records changed.`);
            resolve();
          }
        });
      });
    }
  
    // 유저 돈 업데이트
    function updateUserMoney(id, f_m, chaKey) {
      return new Promise((resolve, reject) => {
        db.run('UPDATE user_M SET Money = ? WHERE userKey = ?', [f_m, id], function (err) {
          if (err) {
            reject(err);
          } else {
            console.log(`User Money Updated: ${this.changes} records changed.`);
            resolve();
          }
        });

        dbCha.run('UPDATE chaM SET Money = ? WHERE chaKey = ?', [f_m, chaKey], function (err) {
          if (err) {
            reject(err);
          } else {
            console.log(`User Money Updated: ${this.changes} records changed.`);
            resolve();
          }
        });
      });
    }
  
    // 자산 정보 삽입
    function insertAssets(id, b_pd_nm, b_pd_id, useSn, user_name, toBuyProductCount,world,chaKey) {
      return new Promise((resolve, reject) => {
        //물건갯수에 맞게 포문돌기
        for(let i =0; i < toBuyProductCount; i++){
          db.run('INSERT INTO assets (assetsWithUserId, PdNm, PdId, useSn, name, worldKey, chaKey) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, b_pd_nm, b_pd_id, useSn, user_name, world, chaKey], function (err) {
            if (err) {
              console.error(err.message);
              reject(err);
            } else {
              console.log(`Asset Inserted: ${this.changes} records changed.`);
              resolve();
            }
          });
        }
      });
    }
  
    //db끄기
    function shutDb(){
      return new Promise((resolve, reject) => {
        db.close((err) => {
          if (err) {
            reject(err);
            console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
          } else {
            console.log('데이터베이스 연결이 종료되었습니다.');
            resolve();
          }
        });
        dbCha.close((err) => {
          if (err) {
            reject(err);
            console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
          } else {
            console.log('데이터베이스 연결이 종료되었습니다.');
            resolve();
          }
        });
      });
    }
  
    processProducts(req, res);
  
  })

  module.exports = router;