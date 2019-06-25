/*jshint esversion: 9 */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.end();
});

router.get('/search/:movie', (req, res, next) => {
  res.end();
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