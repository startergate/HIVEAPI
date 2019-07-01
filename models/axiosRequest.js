/*jshint esversion: 9 */

const axios = require("axios");

const createInstance = (url) => {
  axios.create({
    baseURL: url,
    timeout: 3000,
    headers: {
      'Host': url.split('://')[1].split('/')[0]
    }
  });
};

module.exports = createInstance;