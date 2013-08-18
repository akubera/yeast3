/*
 *  game.js.default
 *
 *  A game between two users.  Can have other observers.
 */

util = require('util');
EventEmitter = require('events').EventEmitter;
Board = require('./board');

function Game(user0, user1) {
  var self = this;
  this.board = new Board(true);
  this.user0 = user0;
  this.user1 = user1;

  this.board.on("move", function(data) {
    var user = null;
    if (data.playerNumber == 0) {
      user = self.user0;
    } else {
      user = self.user1;
    }
    self.emit("move", {username:user, playerNumber:data.playerNumber, coordinates:data.coordinates});
  });
  
  this.move = function(username, coordinates) { 
    var playerNumber = null;
    if (username == user0) {
      playerNumber = 0;
    } else {
      playerNumber = 1;
    }

    self.board.move(playerNumber, coordinates);
  }

  this.toJSON = function() {
    return {"user0": this.user0, "user1": this.user1};
  }

  return this;
}
util.inherits(Game, EventEmitter);

module.exports = Game;
