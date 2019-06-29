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

router.get('/search', (req, res, next) => {
  res.send({
    result: {}
  });
});

router.get('/search/:movie', (req, res, next) => {
  var result = {
    result: {}
  };
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
    },
    timeout: 3000
  }).then(response => {
    const $ = cheerio.load(response);

    const $bodyList = $("li.css-106b4k6-Self");

    console.log($bodyList.length);

    $bodyList.each(function(i, elem) {
      result.result[$(this).find('a').attr('href').replace('/ko-KR/contents/', '')] = $(this).find('.css-gt67eo-TopResultItemTitle').text();
    });
    res.send(result);
  }).catch(err => {
    console.log(err);
    res.status(500).send(err);
  });
  return;
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