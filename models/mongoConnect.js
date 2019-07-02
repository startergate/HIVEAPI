/*jshint esversion: 9 */

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');


const url = 'mongodb://127.0.0.1:27017';
// Database Name
var dbo;
const dbName = 'hive';
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("연결 성공");
  dbo = client.db(dbName);
});

module.exports = dbo;