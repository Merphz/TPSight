/**
 * Created by jarij on 20/05/2016.
 */
'use strict';
const ItemWatcher = require('./watchers/item_watcher');
const tp = require('./gw2_api/trading_post');

const deepScanInterval = 60 * 1000; //every minute
const lightScanInterval = 60 * 1000 * 60; //every hour

class Scanner {
  constructor() {
    this.itemWatchers = [];
  }

  start() {
    this.itemWatchers = [];
    tp.getItemIds((chunk) => {
      const items = JSON.parse(chunk);

      for (const itemId of items) {
        //console.log('Registering item watcher for id ' + itemId);
        let watcher = new ItemWatcher(itemId);
        this.itemWatchers.push(watcher);
        watcher.start(lightScanInterval);
      }
    });
    }
}





module.exports = Scanner;