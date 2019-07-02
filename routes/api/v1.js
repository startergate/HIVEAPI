/*jshint esversion: 9 */

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const createInstance = require('../../models/axiosRequest');
const movie = require('../../modules/movieSync');
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
  const instance = createInstance("https://watcha.com/ko-KR/");

  instance.get('/search', {
    params: {
      'query': req.params.movie
    },
    timeout: 3000
  }).then(response => {
    const $ = cheerio.load(response.data.split('&quot;').join('"'));

    const $bodyList = $(".css-106b4k6-Self");

    $bodyList.each(function(i, elem) {
      let watchaid = $(this).find('a').attr('href').replace('/ko-KR/contents/', '');
      result.result[watchaid] = {
        title: $(this).find($('.css-gt67eo-TopResultItemTitle')).text(),
        type: $(this).find($('.css-nk1bpv-TopResultContentType')).text()
        //poster: $(this).find($('.ewlo9841'))[0].attr('src')
      };
      /*if (!res.headersSent) {
        console.log($(this).find('a').html());
        console.log($(this).find($('.ewlo9840')).html());
        console.log($(this).find($('.ewlo9840')).length);
      }*/

      //console.log($(this).find($('.css-p4k02n-Image-LazyLoadingImg')).html());
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
    const $ = cheerio.load(response.data.split('&quot;').join('"'));

    const $bodyList = $(".css-106b4k6-Self");

    $bodyList.each(function(i, elem) {
      let watchaid = $(this).find('a').attr('href').replace('/ko-KR/contents/', '');
      result.result[watchaid] = {
        title: $(this).find($('.css-gt67eo-TopResultItemTitle')).text(),
        release: "",
      };
    });
    res.send(result);
  });
});

router.get('/movie/imdb/:id', (req, res, next) => {
  if (true) {

  }
});

router.get('/movie/imdb/:id', (req, res, next) => {

});

router.get('/id/:movie', (req, res, next) => {

});
module.exports = router;