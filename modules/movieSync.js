/*jshint esversion: 9 */

const axios = require('axios');
const cheerio = require('cheerio');
const urlencode = require('urlencode');
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
        if (res) {
          this.update(watchaID[j]);
          return;
        }
        const instanceWatcha = createInstance("https://watcha.com/ko-KR/");
        const instanceImdb = createInstance("https://www.imdb.com/");
        //const instanceRotten = createInstance("https://www.rottentomatoes.com/");
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
            if (title == '-') return;
            let promises = [];
            db.findMovie(watchaID[j], (err, res) => {
              promises.push(instanceNaver.get('/search/result.nhn', {
                params: {
                  query: title,
                  section: 'movie'
                }
              }).then(response => {
                const $ = cheerio.load(response.data.split('&quot;').join('"'));
                const $result = $(".search_list_1 > li");
                var naverid;
                db.findMovie(watchaID[j], (err, res) => {
                  $result.each(function(index, el) {
                    let yearlocal = 0;
                    naverid = $(this).find($('dl > dt > a')).attr('href').split('/movie/bi/mi/basic.nhn?code=').join('').split('/').join('');
                    $(this).find($('dd.etc > a')).each(function(index, el) {
                      if ($(this).attr('href').includes('year')) {
                        yearlocal = $(this).text();
                      }
                    });
                    if (res.released == yearlocal) {
                      db.updateMovie(watchaID[j], {
                        nid: naverid
                      });
                    }
                  });
                });
              })); // 네이버 영화 ID 처리

              let enMovieSearchQuery = urlencode(`${title} (${res.released})`);
              promises.push(instanceImdb.get('/find', {
                params: {
                  q: enMovieSearchQuery.split('%20').join('+')
                }
              }).then(response => {
                const $ = cheerio.load(response.data.split('&quot;').join('"'));
                let $table = $("table.findList");
                let target = $table.find('tr > td.result_text').first().find('a');
                db.updateMovie(watchaID[j], {
                  iid: target.attr('href').split('/')[2]
                });
              }));

              /*instanceRotten.get('/search/', {
                params: {
                  search: enMovieSearchQuery
                }
              }).then(response => {
                const $ = cheerio.load(response.data.split('&quot;').join('"'));
                let $table = $(".results_ul");
                let target = $table.find($('span.bold')).first().find('a');
                db.updateMovie(watchaID[j], {
                  iid: target.attr('href').split('/')[2]
                });
              });*/
              Promise.all(promises).then(_ => {
                this.update(watchaID[j]);
              });
            });
          });
        }).catch(err => {});
      });
    }
  }

  update(watchaID) {
    // 메타크리틱, 로튼 토마토, 네이버 영화, IMDB 스코어 업데이트
    const instanceWatcha = createInstance("https://watcha.com/ko-KR/");
    const instanceImdb = createInstance("https://www.imdb.com/");
    //const instanceRotten = createInstance("https://www.rottentomatoes.com/");
    const instanceNaver = createInstance("https://movie.naver.com/movie");

    db.findMovie(watchaID, (err, res) => {
      if (res.hasOwnProperty('iid')) {
        instanceImdb.get(`/title/${res.iid}/`, {
          timeout: 3000
        }).then(response => {
          const $ = cheerio.load(response.data.split('&quot;').join('"'));
          let $iScore = $('[itemprop=ratingValue]');
          db.updateMovie(watchaID, {
            'critics.imdb': $iScore.text() * 1
          });
        }).catch(err => {});
      }

      instanceWatcha.get(`/contents/${res.wid}`, {
        timeout: 3000
      }).then(response => {
        const $ = cheerio.load(response.data.split('&quot;').join('"'));
        let $wScore = $('.e1sxs7wr16');
        let $wPlay = $('.css-2hlxoa-Self.eq7vxcy0');
        let $wPlayTitle = $wPlay.find($('.css-13iaeui-Title'));
        let wPlayExist = false;
        if ($wPlayTitle.text() === '왓챠플레이') {
          wPlayExist = true;
        }
        db.updateMovie(watchaID, {
          'critics.watcha': $wScore.text().split('평점 ★').join('').split(' (')[0] * 2,
          'vod.watcha': wPlayExist
        });
      }).catch(err => {});

      if (res.hasOwnProperty('nid')) {
        instanceNaver.get(`/bi/mi/basic.nhn?code=${res.nid}`, {
          timeout: 3000
        }).then(response => {
          const $ = cheerio.load(response.data.split('&quot;').join('"'));
          let $nScore = $('#content > div > div.mv_info_area > div.mv_info > div.main_score > div.score.score_left > div.star_score');
          let text = $nScore.text().replace(/(^\s*)|(\s*$)/gi, "")
          if (text) {
            db.updateMovie(watchaID, {
              'critics.naver': $nScore.text().replace(/(^\s*)|(\s*$)/gi, "") * 1
            });
          }
        });
      }
    });


    // 넷플릭스, 왓챠, 아마존 판매 조회

    if (true) {
      this.oldReInit(watchaID);
    }
  }

  oldReInit(watchaID) {
    // imdb 이미지

    // related 영화 조회
  }

  getMovie(watchaID, callback) {
    db.findMovie(watchaID, (err, res) => {
      callback(res);
    });
  }
}

module.exports = new HIVEMovieUpdater();