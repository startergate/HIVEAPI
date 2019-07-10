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

router.get('/login', (req, res, next) => {
  sid.loginAuth(req.param.clientid, req.param.sessid).then(result => {
    req.session.sessid = result.sessid;
    req.session.pid = result.pid;
    req.session.nickname = result.nickname;
    req.session.expire = result.expire;
    res.redirect('/');
  });
  res.redirect('/');
});

module.exports = router;