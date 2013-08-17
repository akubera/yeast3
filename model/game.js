/*
 *  game.js.default
 *
 *  A game between two users.  Can have other observers.
 */

var util = require('util');
var EventEmitter = require('events').EventEmitter;
Board = require('./board');

function Game(user0, user1) {
  var self = this;
  this.board = new Board();
  this.user0 = user0;
  this.user1 = user1;

  return this;
}
util.inherits(EventEmitter, Game);

module.exports = Game;
