/*jshint esversion: 9 */

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mongoUser = require('../modules/userGetter');

const url = `mongodb://${mongoUser.id}:${mongoUser.pw}@54.180.27.126:27017`;
// Database Name
var dbo;
const dbName = 'hive';
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  dbo = client.db(dbName);
});

module.exports = dbo;