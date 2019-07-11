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

router.get('/movie', (req, res, next) => {
  res.redirect('/');
});

router.get('/movie/:wid', (req, res, next) => {
  movie.movie([req.params.wid], _ => {
    movie.getMovie(req.params.wid, (result) => {
      if (req.session.sessid) {
        movie.getLiked(req.session.pid, (liked) => {
          let vars = JSON.stringify(liked);
          if (result.images) {
            res.render('movie', {
              session: !!req.session.sessid,
              pid: req.session.pid,
              docs: result,
              bgImg: result.images[Math.floor(Math.random() * result.images.length)],
              liked: vars
            });
          } else {
            res.render('movie', {
              session: !!req.session.sessid,
              pid: req.session.pid,
              docs: result,
              liked: vars
            });
          }
        });
      } else {
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
      }
    });
  }, headTo => {
    res.redirect('/wait?headTo=/movie/' + req.params.wid);
  });
});

router.get('/wait', (req, res, next) => {
  res.send(`Loading...<script>setTimeout(function () {
    location.href = '${req.query.headTo}'
  }, 10000);</script>`);
});

module.exports = router;