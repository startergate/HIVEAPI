/*jshint esversion: 9 */

const express = require('express');
const sid = require('@startergate/sidjs');
const router = express.Router();

/* GET home page. */
router.all('/', (req, res, next) => {
  res.redirect('./liked');
});

router.get('/liked', (req, res, next) => {
  res.render('liked');
});

router.get('/auth', (req, res, next) => {
  sid.loginAuth(req.cookies.sid_clientid, req.query.sessid).then(result => {
    console.log(result);
    req.session.sessid = result.sessid;
    req.session.pid = result.pid;
    req.session.nickname = result.nickname;
    req.session.expire = result.expire;
    res.redirect('/');
  }).catch(err => {
    console.log(err);
    res.redirect('/');
  });
});

module.exports = router;