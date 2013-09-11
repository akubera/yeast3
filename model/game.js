/*
 *  game.js.default
 *
 *  A game between two users.  Can have other observers.
 */

util = require('util');
EventEmitter = require('events').EventEmitter;
Board = require('./board');

function Game(user0, user1) {
  // closure reference
  var self = this;

  // board this game will use (3x3)
  this.board = new Board(3, true);

  // the two users of the game
  this.user0 = user0;
  this.user1 = user1;
  
  // actions when player makes a move
  this.board.on("move", function(data) {
    var user = null;
    if (data.playerNumber == 0) {
      user = self.user0;
    } else {
      user = self.user1;
    }
    self.emit("move", {username:user, playerNumber:data.playerNumber, coordinates:data.coordinates});
  });
  
  // I don't know what this does. makes the move on the board? - Andy
  this.move = function(username, coordinates) { 
    var playerNumber = null;
    if (username == user0) {
      playerNumber = 0;
    } else {
      playerNumber = 1;
    }

    self.board.move(playerNumber, coordinates);
  }

  // creates a simple JSON object
  this.toJSON = function() {
    return {"user0": this.user0, "user1": this.user1, "board" : self.board.toJSON()};
  }
  
  // inits from a JSON object
  this.fromJSON = function(obj) {
    self.user0 = obj.user0;
    self.user1 = obj.user1;
    self.board = Board.fromJSON(obj.board);
  }

  return this;
}

// allow events
util.inherits(Game, EventEmitter);

module.exports = Game;
