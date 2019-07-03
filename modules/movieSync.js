/*jshint esversion: 9 */

const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../models/mongoConnect');
const createInstance = require('../models/axiosRequest');

class HIVEMovieUpdater {
  movie(watchaID) {
    if (watchaID.length < 1) return;
    // 왓챠 정보 열람 (제목, 년도, 영문 이름,)
    for (var i in watchaID) {
      let j = i;
      db.findMovie(watchaID[j], (err, res) => {
        if (err) throw err;
        if (res) return;
        const instanceWatcha = createInstance("https://watcha.com/ko-KR/");
        instanceWatcha.get(`/contents/${watchaID[j]}`, {
          timeout: 10000
        }).then(response => {
          const $ = cheerio.load(response.data.split('&quot;').join('"'));
          const $movieinfo = $('.css-13h49w0-PaneInner');
          const nameKO = $movieinfo.find($('.css-13a04pq-Title')).text();
          const releaseYear = $movieinfo.find($('.css-w4pu2t-Detail')).text().split(' ・ ')[0];
          db.insertMovie({
            wid: watchaID[j],
            title: nameKO,
            released: releaseYear,
            lastUpdate: new Date()
          });
        }).then(_ => {
          instanceWatcha.get(`/contents/${watchaID[j]}/`, {
            timeout: 3000
          }).then(response => {
            const $ = cheerio.load(response.data.split('&quot;').join('"'));
            let $info = $(".e1eaz83l0");
            const nameEN = $info.find($('.e1eaz83l3')).text();
            db.updateMovie(watchaID[j], {
              title_en: nameEN
            });
          });
          this.update(watchaID);
        });
      });
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