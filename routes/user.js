/*jshint esversion: 9 */

const express = require('express');
const sid = require('@startergate/sidjs');
const movie = require('../modules/movieSync');
const db = require('../models/mongoConnect');
const router = express.Router();

/* GET home page. */
router.all('/', (req, res, next) => {
  res.redirect('./liked');
});

router.get('/liked', (req, res, next) => {
  if (!req.session.sessid) {
    res.redirect('/');
    return;
  }
  movie.getLiked(req.session.pid, (liked) => {
    let vars = JSON.stringify(liked);
    res.render('liked', {
      pid: req.session.pid,
      liked: vars
    });
  });
});

router.get('/auth', (req, res, next) => {
  sid.loginAuth(req.cookies.sid_clientid, req.query.sessid).then(result => {
    req.session.sessid = result.sessid;
    req.session.pid = result.pid;
    req.session.nickname = result.nickname;
    req.session.expire = result.expire;
    db.findUser(result.pid, (err, res) => {
      if (res) {
        db.updateUser(result.pid, {
          lastSession: result.sessid
        }, err => {
          console.log(err);
        });
        return;
      }
      db.insertUser({
        pid: result.pid,
        lastSession: result.sessid,
        liked: {}
      });
    });
    res.redirect('/');
  }).catch(err => {
    console.log(err);
    res.redirect('/');
  });
});

router.get('/logout', (req, res, next) => {
  sid.logout(req.session.clientid, req.session.sessid);
  req.session.destroy(_ => {
    req.session;
  });
  res.send('<script>history.back()</script>');
});

module.exports = router;