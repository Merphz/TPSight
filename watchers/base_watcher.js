/**
 * Created by jarij on 20/05/2016.
 */
'use strict';

class Watcher {
  constructor() {
    this.events = {};
    this.timer = null;
    this.interval = 0;
  }

  start(interval) {
    this.interval = interval;
    const owner = this;
    if (this.timer) this.stop();
    this.timer = setInterval(function() {
      if ('interval' in owner.events) {
        owner.events['interval'](owner);
      }
    }, this.interval);
    // Run on start
    if ('interval' in owner.events) {
      owner.events['interval'](owner);
    }
  }

  stop() {
    if (!this.timer) return;
    clearInterval(this.timer);
    if ('stop' in this.events) {
      this.events['stop']();
    }
    this.timer = null;
  }

  setInterval(interval) {
    this.interval = interval;
    if (this.timer) {
      this.stop();
      this.start();
    }
  }

  on(message, callback) {
    this.events[message] = callback;
  }

}

module.exports = Watcher;