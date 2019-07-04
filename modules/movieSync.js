/*jshint esversion: 9 */

const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../models/mongoConnect');
const createInstance = require('../models/axiosRequest');

class HIVEMovieUpdater {
  isPrintableASCII(string) {
    return /^[\x20-\x7F]*$/.test(string);
  }

  movie(watchaID) {
    if (watchaID.length < 1) return;
    // 왓챠 정보 열람 (제목, 년도, 영문 이름,)
    for (var i in watchaID) {
      let j = i;
      db.findMovie(watchaID[j], (err, res) => {
        if (err) throw err;
        if (res) return;
        const instanceWatcha = createInstance("https://watcha.com/ko-KR/");
        const instanceImdb = createInstance("https://www.imdb.com/");
        const instanceNaver = createInstance("https://movie.naver.com/movie");
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
            lastUpdate: new Date(0)
          });
          return new Promise((resolve, reject) => {
            console.log(nameKO + " " + releaseYear);
            resolve(nameKO, releaseYear);
          });
        }).then((title, year) => {
          instanceWatcha.get(`/contents/${watchaID[j]}/overview`, {
            timeout: 10000
          }).then((response) => {
            const $ = cheerio.load(response.data.split('&quot;').join('"'));
            let $info = $(".e1eaz83l0");
            let nameEN = $info.find($('.e1eaz83l3')).first().text();
            if (!this.isPrintableASCII(nameEN)) {
              nameEN = '-';
            }
            db.updateMovie(watchaID[j], {
              title_en: nameEN
            });
            return new Promise((resolve, reject) => {
              resolve(nameEN, year);
            });
          }).then((title, year) => {
            instanceNaver.get('/search/result.nhn', {
              params: {
                query: title,
                section: 'all'
              }
            }).then(response => {
              const $ = cheerio.load(response.data.split('&quot;').join('"'));
              const $result = $(".search_list_1 > li");
              var naverid;
              console.log($result.length);
              db.findMovie(watchaID[j], (err, res) => {
                $result.each(function(index, el) {
                  let yearlocal = 0;
                  naverid = $(this).find($('dl > dt > a')).attr('href').split('/movie/bi/mi/basic.nhn?code=').join('').split('/').join('');
                  $(this).find($('dd.etc > a')).each(function(index, el) {
                    console.log($(this).attr('href'));
                    if ($(this).attr('href').includes('year')) {
                      yearlocal = $(this).text();
                    }
                  });
                  console.log(res.released);
                  console.log(yearlocal);
                  if (res.released == yearlocal) {
                    db.updateMovie(watchaID[j], {
                      nid: naverid
                    });
                  }
                });
              });

              return new Promise((resolve, reject) => {
                resolve(naverid);
              })
            }).then((naverid) => {
              instanceNaver.get('/bi/mi/basic.nhn', {
                params: {
                  code: naverid
                }
              }).then(response => {
                const $ = cheerio.load(response.data.split('&quot;').join('"'));
                let $infoarea = $('.mv_info_area');
                let nameEN = $infoarea.find($('strong.h_movie2')).text().split(',')[0];
                if (!this.isPrintableASCII(nameEN)) {
                  db.updateMovie(watchaID[j], {
                    title_en: nameEN
                  });
                }
              });
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