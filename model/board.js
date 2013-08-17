/*
 *  board.js.default
 *
 *  A game between x's and o's.  x's start, o's follow.  Follows rules of super tic-tac-toe.
 */

var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Board(big) {
  var self = this;
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

  this.move = function(mark, spot) {
    // Spot is an array of 2*boardDepth, where board depth is the number of
    // levels including this one
    if (mark != 0 || mark != 1) {
      throw "Board can only mark 0's and 1's!"
    }
    
    var next = this.grid[spot[0],spot[1]];
    if (big) {
      nextBoard.move(mark, spot.slice(2,4));
    } else {
      this.grid[spot[0],spot[1]] = mark;
    }
    this.emit('move', mark, spot);
  }

  return this;
}
util.inherits(EventEmitter, Board);

module.exports = Board;
