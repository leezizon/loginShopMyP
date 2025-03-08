var express = require('express');
const sqlite3 = require('sqlite3').verbose();

//app에서가져온 router
var router = express.Router();

//유저포지션
router.get('/userPosition', function(req, res, next) {
  res.render('userPosition.html');
});

router.get('/whenSeq', function(req, res, next) {
  let whens = [];
  const db = new sqlite3.Database('./public/db/userPosition.db', (err) => {
    if (err) {
        console.error(err.message);
    }
  });
  
  db.all('SELECT * FROM sixOfWhen ORDER BY whenV ASC', (err, rows) => {
    if (err) {
      return res.send('데이터베이스에서 정보를 가져오지 못했습니다.');
    }
    var whenSn = 0;
    rows.forEach(row => {
      whenSn = whenSn +1;
      whens.push({sn: whenSn, idx : row.idx, when: row.whenV});
    });
    // 렌더링된 HTML을 클라이언트로 보냄
    //res.header("Access-Control-Allow-Origin", "*");
    res.send({ whens : whens});
  });

  //close the database connection
  db.close((err) => {
    if (err) {
      console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
    } else {
      console.log('데이터베이스 연결이 종료되었습니다.');
    }
  });
});

router.post('/selectUserPosition', async (req, res) => {
  let tableHtml;
  let selectHtml_who;
  let selectHtml_where;
  let selectHtml_when;
  let positions = [];


  let query = `SELECT IDX,WHO,WHEN_EVENT,WHERE_EVENT,WHAT,X,Y,WHEN_EVENT_SEQ,WHO_EVENT_SEQ FROM sixPrinciples`;
  let query_who = `SELECT * FROM sixOfWho`;
  let query_where = `SELECT * FROM sixOfWhere`;
  let query_when = `SELECT * FROM sixOfWhen`;

  
  const db = new sqlite3.Database('./public/db/userPosition.db', (err) => {
    if (err) {
        console.error(err.message);
    }
  });
  
  



  // 여러 개의 쿼리를 비동기적으로 실행
  const queryAlls = await queryAll();  // 첫 번째 쿼리
  const queryWhos = await queryWho();  // 두 번째 쿼리
  const queryWheres = await queryWhere();  // 두 번째 쿼리
  const queryWhens = await queryWhen();  // 두 번째 쿼리
  

  // select옵션생성
  selectHtml_who = '<select>';
  queryWhos.forEach((row) => {
    selectHtml_who += `<option value="${row.idx}">${row.whoV}</option>`;
    console.log(row.whoV);
  });
  selectHtml_who += '</select>';

   selectHtml_when = '<select>';
  queryWhens.forEach((row) => {
    selectHtml_when += `<option value="${row.idx}">${row.whenV}</option>`;
    console.log(row.whenV);
  });
  selectHtml_when += '</select>';

   selectHtml_where = '<select>';
  queryWheres.forEach((row) => {
    selectHtml_where += `<option value="${row.idx}">${row.whereV}</option>`;
    console.log(row.whereV);
  });
  selectHtml_where += '</select>';

   // HTML 표 생성
  tableHtml = '<table id ="myTable"> <tbody><tr><th>N</th><th>WHO</th><th>WHEN</th><th>WHERE</th><th>WHAT</th><th>X</th><th>Y</th></tr>';
  queryAlls.forEach((row) => {
    tableHtml += `<tr><td>${row.IDX}</td><td>${row.WHO}</td><td>${row.WHEN_EVENT}</td><td>${row.WHERE_EVENT}</td><td>${row.WHAT}</td><td>${row.X}</td><td>${row.Y}</td></tr>`;
    //캐릭터 색 배치를 위해 쿼리 끼우기(row2.whoC를 추가하기위함)
    queryWhos.forEach((row2) => {
      //겹포문으로 수가 늘어나지않도록 같은 idx를 가진 row만 push
      if(row2.idx==row.WHO_EVENT_SEQ){
        positions.push({idx: row.IDX, who: row.WHO, when: row.WHEN_EVENT, where: row.WHERE_EVENT, what: row.WHAT, x: row.X, y: row.Y, whenSeq: row.WHEN_EVENT_SEQ, whoSeq: row.WHO_EVENT_SEQ, whoColor: row2.whoC });
        console.log(row2.whoC );
        console.log(row.WHO_EVENT_SEQ);
      }
    });
  });
  tableHtml += '</tbody></table>';
    
    

    // 렌더링된 HTML을 클라이언트로 보냄
    //res.header("Access-Control-Allow-Origin", "*");
  res.send({sh_who : selectHtml_who, sh_where : selectHtml_where, sh_when : selectHtml_when , pd : tableHtml, posi : positions});
    // 첫 번째 쿼리를 실행하는 함수

    function queryWho() {
      return new Promise((resolve, reject) => {
        db.all(query_who, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }

    function queryWhen() {
      return new Promise((resolve, reject) => {
        db.all(query_when, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }

    function queryWhere() {
      return new Promise((resolve, reject) => {
        db.all(query_where, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }

    function queryAll() {
      return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }

  //close the database connection
  db.close((err) => {
    if (err) {
      console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
    } else {
      console.log('데이터베이스 연결이 종료되었습니다.');
    }
  });
});

//유저포지션받기
router.post('/insertData', (req, res) => {
  let { who, when, where, what, p_x, p_y } = req.body;

  let db = new sqlite3.Database('./public/db/userPosition.db', (err) => {
    if (err) {
        console.error(err.message);
    }
  });

  db.run('INSERT INTO sixPrinciples ( WHO, WHEN_EVENT, WHERE_EVENT, WHAT, X, Y) VALUES (?, ?, ?, ?, ? ,?)', [who, when, where, what, p_x, p_y], function(err) {
    if (err) {
      console.log('인서트에인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러 에러');
      return console.error(err.message);
    }
    console.log(`레코드가 업데이트되었습니다: ${this.changes} 개의 레코드가 변경되었습니다.`);
  });

  db.close((err) => {
    if (err) {
      console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
    } else {
      console.log('데이터베이스 연결이 종료되었습니다.');
    }
  });
  // 여기서는 가짜 응답을 보냄 (실제로는 디비에 데이터를 삽입하는 코드를 추가해야 함)
  res.json({ success: true, message: 'Data inserted successfully' });
});


module.exports = router;