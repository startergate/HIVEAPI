/*jshint esversion: 9 */

const express = require('express');
const getHtml = require('../../models/axiosRequest');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.end();
});

router.get('/search/:movie', (req, res, next) => {
  var result = {
    result: {}
  };
  getHtml("https://watcha.com/ko-KR/search?query=" + req.params.movie).then(html => {
      let titleList = {};
      const $ = cheerio.load(html.data);
      const $bodyList = $.find("li.css-106b4k6-Self");

      $bodyList.each(function(i, elem) {
        result.result[$(this).find('a').attr('href').replace('/ko-KR/contents/', '')] = $(this).find('.css-gt67eo-TopResultItemTitle').text();
      });

      return data;
    })
    .then(res => {
      res.end(result);
    });
});

router.get('/search/watcha/:movie', (req, res, next) => {

});

router.get('/search/imdb/:movie', (req, res, next) => {

});

router.get('/movie/:id', (req, res, next) => {

});

router.get('/movie/watcha/:id', (req, res, next) => {
  if (true) {

  }
});

router.get('/movie/imdb/:id', (req, res, next) => {

});

router.get('/id/:movie', (req, res, next) => {

});
module.exports = router;