/*jshint esversion: 9 */

const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const getHtml = require('../../models/axiosRequest');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.end();
});

router.get('/search/:movie', (req, res, next) => {
  const options = {
    uri: "https://watcha.com/ko-KR/search?query=" + req.params.movie,
    encoding: "utf8",
    headers: {
      'User-Agent': 'request',
      'Accept': '*/*',
      'Cache-Control': 'no-cache',
      'Host': 'watcha.com',
      'accept-encoding': 'gzip, deflate',
      'Connection': 'keep-alive'
    }
  };
  request(options, (err, results, body) => {
    try {
      var result = {
        result: {}
      };
      let titleList = {};
      console.log(results);
      res.end(body);
      return;
      body = iconv.decode(body, 'euc-kr');
      console.log(body);
      const $ = cheerio.load(body);
      const $bodyList = $.find("li.css-106b4k6-Self");

      $bodyList.each(function(i, elem) {
        result.result[$(this).find('a').attr('href').replace('/ko-KR/contents/', '')] = $(this).find('.css-gt67eo-TopResultItemTitle').text();
      });
      res.end(result);
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    } finally {

    }
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