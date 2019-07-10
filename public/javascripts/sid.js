/*jshint esversion: 9 */

class SID {
  constructor(clientname) {
    if (typeof jQuery == 'undefined') {
      throw new Error("SID.js for Client requires jQuery");
    }
    if (!window.localStorage) {
      throw new Error("SID.js for Client requires Local Storage support in browser");
    }
    if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.userAgent.indexOf('Trident') !== -1) { //Client Browser Detection
      throw new Error("SID.js for Client don't support IE");
    }
    this.clientname = clientname;
  }

  checkID(id, callback) {
    $.ajax({
      url: 'http://sid.donote.co:3000/api/v1/id/' + id + '/exist/bool',
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        callback(data.is_exist);
      }
    });
  }

  getProfile(clientid, sessid, callback) {
    $.ajax({
      url: 'http://sid.donote.co:3000/api/v1/pfimg',
      type: 'GET',
      dataType: 'json',
      data: {
        'type': 'get',
        'data': 'pfimg',
        'clientid': clientid,
        'sessid': sessid
      },
      success: (data) => {
        callback(data.requested_data);
      }
    });
  }

  getClientID() {
    if (localStorage.sid_clientid) {
      return localStorage.sid_clientid;
    }
    return false;
  }

  getSessID() {
    if (localStorage.sid_sessid) {
      return localStorage.sid_sessid;
    }
    return false;
  }

  createClientID(devicedata) {
    $.ajax({
      url: 'http://sid.donote.co:3000/api/v1/clientid',
      type: 'POST',
      dataType: 'json',
      data: {
        'type': 'create',
        'data': 'clientid',
        'devicedata': devicedata
      },
      success: (data) => {
        localStorage.sid_clientid = data.response_data;
      }
    });
  }

  login(clientid, id, pw, callback) {
    console.log({
      'type': 'login',
      'clientid': clientid,
      'userid': id,
      'password': pw,
      'isPermanent': false,
      'isWeb': true,
      'isClient': true
    });
    $.ajax({
      url: 'http://sid.donote.co:3000/api/v1/session/',
      type: 'POST',
      dataType: 'json',
      data: {
        'type': 'login',
        'clientid': clientid,
        'userid': id,
        'password': pw,
        'isPermanent': false,
        'isWeb': true,
        'isClient': true
      },
      success: (data) => {
        var output = {};
        if (data.type == 'error') {
          callback({
            error: 1
          });
          return
        }
        output.sessid = data.response_data[0];
        output.pid = data.response_data[1];
        output.nickname = data.response_data[2];
        output.expire = data.response_data[3];
        callback(output);
      }
    }).fail();
  }

  register(clientid, id, pw, nickname, callback) {
    $.ajax({
      url: 'http://sid.donote.co:3000/api/v1/user/',
      type: 'POST',
      dataType: 'json',
      data: {
        'type': 'register',
        'clientid': clientid,
        'userid': id,
        'nickname': nickname,
        'password': pw
      },
      success: (data) => {
        callback(data.private_id);
      }
    });
  }
}