/*jshint esversion: 9 */

const express = require('express');
const movie = require('../modules/movieSync');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {
    session: !!req.session.sessid,
    pid: req.session.pid
  });
});

router.get('/movie/:wid', (req, res, next) => {
  movie.movie([req.params.wid], _ => {
    movie.getMovie(req.params.wid, (result) => {
      console.log(result);
      if (result.images) {
        res.render('movie', {
          session: !!req.session.sessid,
          pid: req.session.pid,
          docs: result,
          bgImg: result.images[Math.floor(Math.random() * result.images.length)]
        });
      } else {
        res.render('movie', {
          session: !!req.session.sessid,
          pid: req.session.pid,
          docs: result
        });
      }
    });
  });
});

module.exports = router;