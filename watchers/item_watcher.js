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


var addListings = function(itemId, listings) {
  mongo.connect(connString, function(err, db) {
    //assert.equal(err, null);

    if (err != null) {
      console.log('Could not connect to the db server');
      return;
    }

    db.collection('tp_items', (err, collection) => {

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
            //console.log('db push item: ' + itemId);
             /*Push listings to the db. If itemId does not exists it creates a new object.*/
            collection.updateOne(
                { 'itemId': itemId },
                { $set: { latestHash: listingHash },
                  $push: { 'listings': {
                    timestamp: new Date().toISOString(), 'listings': listings, 'hash': listingHash} }
                },
                { upsert: true }
            );
          } catch (e) {
            print(e);
          }
        }
        db.close();
      });


      if (cursor.count() > 0) {
        // Listings already exists
        console.log('already exists');
        console.log('cursor count: ' + cursor.count());
        db.close();
        return;
      }

      /*console.log('db push item: ' + itemId);
      /*Push listings to the db. If itemId does not exists it creates a new object.*/

      /*

      db.close();*/
    });
  });
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
        //console.dir(item);
        addListings(item.id, {buys: item.buys, sells: item.sells});
      });
    })
  }
}

module.exports = ItemWatcher;
