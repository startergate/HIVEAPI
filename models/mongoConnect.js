/*jshint esversion: 9 */

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mongoUser = require('../modules/userGetter');

const url = `mongodb://${mongoUser.id}:${mongoUser.pw}@54.180.27.126:27017`;
// Database Name
var db;
const dbName = 'hive';
console.log(url);
MongoClient.connect(url, {
  useNewUrlParser: true
}).then(client => {
  db = client.db(dbName);
  console.log(db);
}).catch(err => {
  throw err;
});