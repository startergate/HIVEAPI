/*jshint esversion: 9 */

const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../models/mongoConnect');
const createInstance = require('../models/axiosRequest');

class HIVEMovieUpdater {
  movie(watchaID) {
    console.log(db);
    if (watchaID.length < 1) return;
    // 왓챠 정보 열람 (제목, 년도, 영문 이름,)
    for (var i in watchaID) {
      let j = i;
      db.findMovie(watchaID[j], (err, res) => {
        if (err) throw err;
        console.log(res);
        const instanceWatcha = createInstance("https://watcha.com/ko-KR/");
        instanceWatcha.get(`/contents/${res.watchaid}`, {
          timeout: 3000
        }).then(response => {
          const $ = cheerio.load(response.data.split('&quot;').join('"'));

          const nameKO = $(".css-106b4k6-Self").text();

          db.insertMovie({
            wid: res.watchaid,
            title: nameKO
          });
        });
      });

      this.update(watchaID);
    }
  }

  update(watchaID) {
    // 메타크리틱, 로튼 토마토, 네이버 영화, IMDB 스코어 업데이트

    // 넷플릭스, 왓챠, 아마존 판매 조회

    if (true) {
      this.oldReInit();
    }
  }

  oldReInit(watchaID) {
    // imdb 이미지

    // related 영화 조회
  }
}

module.exports = new HIVEMovieUpdater();