/**
 * Created by jarij on 20/05/2016.
 */
/*jslint node: true */

'use strict';

const Watcher = require('./base_watcher');
const tp = require('../gw2_api/trading_post');
const mongo = require('mongodb').MongoClient;
const assert = require('assert');
const hash = require('json-hash');

//const connString = 'mongodb://Aenox:D7vm4vv6@ds028559.mlab.com:28559/gw2interdb';
const connString = 'mongodb://Aenox:D7vm4vv6@46.101.229.200:27017/gw2tp';

let dbConn = null;

mongo.connect(connString, function(err, db) {
  assert.equal(err, null);
  dbConn = db;
});

var addListings = function(itemId, listings) {
    if (dbConn) {
      dbConn.collection('tp_items', (err, collection) => {
        assert.equal(err, null);

        const listingHash = hash.digest(listings);

        var cursor = collection.find(
            {
              'itemId': {$eq: itemId},
              'latestHash': {$eq: listingHash}
            }
        );
      cursor.limit(1).next(function (err, result) {
        assert.equal(err, null);

        // If does not exist
        if (!result) {
          try {
            console.log('db push item: ' + itemId);
            /*Push listings to the db. If itemId does not exists it creates a new object.*/
            collection.updateOne(
                {'itemId': itemId},
                {
                  $set: {latestHash: listingHash},
                  $push: {
                    'listings': {
                      timestamp: new Date().toISOString(), 'listings': listings, 'hash': listingHash
                    }
                  }
                },
                {upsert: true}
            );
          } catch (e) {
            print(e);
          }
        }
        });
      });
    } else {
      console.log('Database connection is dead');
    }
};

class ItemWatcher extends Watcher {
  constructor(itemId) {
    super();

    this.itemId = itemId;
    this.on('interval', (self) => {
      //console.log('itemId: ' + self.itemId + ": timeout");
      tp.getListings(self.itemId, (chunk) => {
        const item = JSON.parse(chunk);
        if (item.id != self.itemId) {
          console.log('[!]Invalid item id: ');
          console.dir(item);
          return;
        }

        if (this.events['listingsFetched']) {
          this.events['listingsFetched']();
        }

        //console.dir(item);
        addListings(item.id, {buys: item.buys, sells: item.sells});
      });
    })
  }
}

module.exports = ItemWatcher;
