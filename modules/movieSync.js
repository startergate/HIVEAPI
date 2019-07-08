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
              }).catch(err => {
                console.log('naverid' + title);
              })); // 네이버 영화 ID 처리

              let enMovieSearchQuery = urlencode(`${title} (${res.released})`);
              promises.push(instanceImdb.get('/find', {
                params: {
                  q: enMovieSearchQuery.split('%20').join(' ').split('%3A').join(':'),
                  s: 'tt'
                }
              }).then(response => {
                const $ = cheerio.load(response.data.split('&quot;').join('"'));
                let $table = $(".findList");
                let target = $table.find($('tr.findResult')).first().find($('td.result_text')).find('a');
                db.updateMovie(watchaID[j], {
                  iid: target.attr('href').split('/')[2]
                });
              }).catch(err => {
                console.log('imdbid' + title);
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
          }).catch(err => {
            console.log('watchainfoS');
          });
        }).catch(err => {
          console.log('watchainfo');
        });
      });
    }
  }

  update(watchaID) {
    // 메타크리틱, 로튼 토마토, 네이버 영화, IMDB 스코어 업데이트
    const instanceWatcha = createInstance("https://watcha.com/ko-KR/");
    const instanceImdb = createInstance("https://www.imdb.com/");
    //const instanceRotten = createInstance("https://www.rottentomatoes.com/");
    const instanceNaver = createInstance("https://movie.naver.com/movie");
    //const instanceNetflix = createInstance("https://www.netflix.com/");

    db.findMovie(watchaID, (err, res) => {
      if (res.hasOwnProperty('iid')) {
        instanceImdb.get(`/title/${res.iid}/`, {
          timeout: 10000
        }).then(response => {
          const $ = cheerio.load(response.data.split('&quot;').join('"'));
          let $iScore = $('[itemprop=ratingValue]');
          let $mScore = $('.metacriticScore');
          db.updateMovie(watchaID, {
            'critics.imdb': $iScore.text() * 1,
            'critics.metascore': $mScore.text() * 1
          });
        }).catch(err => {
          console.log('IMDb Critic');
          console.log(err);
        });
      }

      instanceWatcha.get(`/contents/${res.wid}`, {
        timeout: 10000
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
          'critics.watcha': $wScore.text().split('평점 ★').join('').split(' (')[0] * 1,
          'vod.watcha': wPlayExist
        });
      }).catch(err => {
        console.log('watcha critic');
      });

      if (res.hasOwnProperty('nid')) {
        instanceNaver.get(`/bi/mi/basic.nhn?code=${res.nid}`, {
          timeout: 10000
        }).then(response => {
          const $ = cheerio.load(response.data.split('&quot;').join('"'));
          let $nScore = $('#content > div > div.mv_info_area > div.mv_info > div.main_score > div.score.score_left > div.star_score');
          let text = $nScore.text().replace(/(^\s*)|(\s*$)/gi, "");
          if (text) {
            db.updateMovie(watchaID, {
              'critics.naver': $nScore.text().replace(/(^\s*)|(\s*$)/gi, "") * 1
            });
          }
        }).catch(err => {
          console.log('naver critic');
        });
      }

      /*instanceNetflix.get('/search', {
        params: {
          q: urlencode(res.title)
        },
        timeout: 3000,
        headers: {
          'cookie': 'nfvdid=BQFmAAEBENTGLCcQMnSwN0JzL91Go51Ai0T2dw7lq-6rFqk4HhFPz0x603eeyE0LC3NU4b69U-5iBZ44yVIfrXoFi5AMrg2MzLxkDF8uXHD6lWeUjPh9LQ%3D%3D; memclid=09086659-a4f9-4fed-8c00-e08652fcd091; NetflixId=v%3D2%26ct%3DBQAOAAEBEC0b1-_apvedl6Ea2Affyv6A8GMutT0q5xEwUNW8ZIhyD8rHk-VE8UPaxPUQbq94vc5YKvCpLF__YsdZ9mUcfCtynb-ts8N92snfiJ6Kk0r3eFNLoyB8lXH9ze5k70VDA2VVPKFI8j6geqRyXJ3X3_eqJQ53eqoLZmeDwJ9kPayctxod5YutHeVI0ovu9Th4PQD8dYalDo-MDjIx6cqjCVHYo3UiUP22bWZq8Fit6O_uMlDnvVAFHH4xYCcdU6OvXdK_R0gUPC3xS9-867q8j0Qtkq-pUZh5sAJkCHDLrjiySc7ukxOMmG5VAO7ZHCg2WvfLihFHNZdoFaMnTBuFlV5GGA..%26bt%3Ddev%26mac%3DAQEAEAABABQzJDp7167VzPGDxcuCL1N8WT1w0aDYwes.; SecureNetflixId=v%3D2%26mac%3DAQEAEQABABQwIrfUUjxszh8EGaf-wVdoxlX-kN8kZpc.%26dt%3D1562444652927; flwssn=c8795e5e-6a2e-41d6-b285-d9417c2ad05b',
          'User-Agent': 'PostmanRuntime/7.15.0',
          'Cache-Control': 'no-cache',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        }
      }).then(response => {
        const $ = cheerio.load(response.data.split('&quot;').join('"'));
        let $card = $('#title-card-0-0');
        let $link = $card.find($('div.ptrack-content > a'));
        let $title = $link.find($('div > div'));
        if (res.title.split(' 시즌')[0]) {

        }
      });*/

      res.lastUpdate.setUTCMonth(res.lastUpdate.getUTCMonth() + 1);
      if (new Date() > res.lastUpdate) {
        this.oldReInit(watchaID);
      }
    });


    // 넷플릭스, 왓챠, 아마존 판매 조회

  }

  oldReInit(watchaID) {
    const instanceImdb = createInstance("https://www.imdb.com/");
    const instanceWatcha = createInstance("https://watcha.com/ko-KR/");

    db.findMovie(watchaID, (err, res) => {
      if (res.hasOwnProperty('iid')) {
        instanceImdb.get(`/title/${res.iid}/`, {
          timeout: 10000
        }).then(response => {
          const $ = cheerio.load(response.data.split('&quot;').join('"'));
          const $poster = $("#title-overview-widget > div.minPosterWithPlotSummaryHeight > div.poster > a > img");
        }).catch(err => {
          console.log('imdb image');
          console.log(err);
        });
        instanceImdb.get(`/title/${res.iid}/mediaindex`, {
          timeout: 10000
        }).then(response => {
          const $ = cheerio.load(response.data.split('&quot;').join('"'));
          const $images = $('#media_index_thumbnail_grid > a');

          $images.each(function(index, el) {
            instanceImdb.get($(this).attr('href'), {
              timeout: 10000
            }).then(response => {
              const $ = cheerio.load(response.data.split('&quot;').join('"'));
              let $img = $('#photo-container > div > div:nth-child(2) > div > div.pswp__scroll-wrap > div.pswp__container > div:nth-child(2) > div > img:nth-child(2)');
              console.log($img);
              db.pushMovie(watchaID, {
                'images': $img.attr('src')
              });
            }).catch(err => {
              console.log('imdb image deep');
              console.log(err);
            });
          });
        }).catch(err => {
          console.log('imdb image index');
        });
      }
    });
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