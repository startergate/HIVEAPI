/*jshint esversion: 9 */

const express = require('express');
const request = require('request');
const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const getHtml = require('../../models/axiosRequest');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.end();
});

router.get('/search/:movie', (req, res, next) => {
  const instance = axios.create({
    baseURL: 'https://watcha.com/ko-KR/',
    timeout: 1000,
    headers: {
      'Host': 'watcha.com'
    }
  });

  instance.get('/search', {
    params: {
      'query': req.params.movie
    }
  }).then(response => {
    console.log(response);
    res.sendStatus(200);
  });


  return;

  const options = {
    uri: "https://watcha.com/ko-KR/search?query=" + req.params.movie,
    headers: {
      '': ''
    }
  };
  request(options, (err, response, body) => {
    console.log(body);
    res.end(body);
  });
  var result = {
    result: {}
  };
  let titleList = {};
  return;
  console.log(body);
  const $ = cheerio.load(body);
  const $bodyList = $.find("li.css-106b4k6-Self");

  $bodyList.each(function(i, elem) {
    result.result[$(this).find('a').attr('href').replace('/ko-KR/contents/', '')] = $(this).find('.css-gt67eo-TopResultItemTitle').text();
  });
  res.end(result);
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