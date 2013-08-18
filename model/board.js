/*
 *  board.js.default
 *
 *  A game between x's and o's.  x's start, o's follow.  Follows rules of super tic-tac-toe.
 */

var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Board(big) {
  var self = this;
  var whoseTurn = 0;
  var previousCoordinates = null;
  var _finished = false;
  this.big = big;
  if (big) {
    this.grid = [[new Board(false), new Board(false), new Board(false)],
                 [new Board(false), new Board(false), new Board(false)],
                 [new Board(false), new Board(false), new Board(false)]];
  } else {
    this.grid = [[null,null,null],
                 [null,null,null],
                 [null,null,null]];
  }

  this.finished = function() {
    return _finished;
  }

  this.move = function(mark, spot) {
    // Spot is an array of 2*boardDepth, where board depth is the number of
    // levels including this one
    if (mark != 0 && mark != 1) {
      throw "Board can only mark 0's and 1's!"
    }

    if (self.big && mark != whoseTurn) {
      //throw "Not your turn!";
      // Drop silently instead.
      return;
    }

    var nextBoard = this.grid[spot[0],spot[1]];
    if (this.big) {
      nextBoard.move(mark, spot.slice(2,4));

      // Update whose turn it is.
      whoseTurn++
      whoseTurn %= 2;

    } else {
      this.grid[spot[0],spot[1]] = mark;
    }
    this.emit('move', {"playerNumber":mark, "coordinates":spot});
  }

  return this;
}
util.inherits(Board, EventEmitter);

module.exports = Board;
