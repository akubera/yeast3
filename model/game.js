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

  board.on("move", function(playerNumber, coordinates) {
    var user = null;
    if (playerNumber == 0) {
      user = self.user0;
    } else {
      user = self.user1;
    }
    self.emit("move", user, coordinates);
  });
  

  this.toJSON = function() {
    return {"user0": this.user0, "user1": this.user1};
  }

  return this;
}
util.inherits(EventEmitter, Game);

module.exports = Game;
