/**
 * Created by jarij on 20/05/2016.
 */

/*jslint node: true */

'use strict';
const https = require('https');

const rootEndpoint = '/v2/commerce/listings'; // prevent exhausting all connections

const timeout = 60 * 10000; // 1 min

var options = {
  hostname: 'api.guildwars2.com',
  port: 443,
  path: '/',
  method: 'GET'
};

const maxConnections = 300;

let currentConnections = 0;

let queue = [];

var pushQueue = function (itemId, callback) {
  queue.push({id: itemId, 'callback': callback});
};

var nextQueue = function () {
  if (queue.length == 0)
      return;

  const item = queue.shift(); // take first and remove it from the queue
  _getListings(item.id, item.callback);
};

var _getListings = function (itemId, callback) {
  currentConnections += 1;

  options.path = rootEndpoint + '/' + itemId;

  var req = https.request(options, function (res) {
    var data = '';
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function () {
      currentConnections--;
      nextQueue();
      callback(data);
    });
  });
  req.on('error', function (err) {
    console.log('problem with request: ' + err);
    currentConnections--;
    nextQueue();
    if (err.code == 'ETIMEDOUT') {
      pushQueue(itemId, callback);
      console.log('url: ' + rootEndpoint + '/' + itemId);
    } else {
      console.dir(err);
    }
  });

  req.end();
};

var getItemIds = function (callback) {
  options.path = rootEndpoint;

  var req = https.request(options, function (res) {
    var data = '';
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function () {
      callback(data);
    });
  });
  req.on('error', function (err) {
    console.log('problem with request: ' + err);
  });
  req.end();
};

var getListings = function(itemId, callback) {
  if (currentConnections >= maxConnections) {
    pushQueue(itemId, callback);
    return;
  }
  _getListings(itemId, callback);
};

module.exports = {
  getItemIds: getItemIds,
  getListings: getListings
};
