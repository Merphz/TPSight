/**
 * Created by JariJ on 9.7.2016.
 */

const timeout = 60 * 10000; // 1 min

var options = {
  hostname: 'api.guildwars2.com',
  port: 443,
  path: '/',
  method: 'GET'
};

module.exports = {options, timeout};