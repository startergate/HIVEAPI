/*jshint esversion: 9 */

const axios = require("axios");
const cheerio = require("cheerio");

const getHtml = async url => {
  try {
    return await axios.get(url);
  } catch (error) {
    console.error(error);
  }
};

module.exports = getHtml;