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
  var _prevCoords = null;
  var _finished = false;
  var _winner = undefined;
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

  this.winner = function() {
    return _winner;
  }

  function checkWin() {
    // check for victory
    // A loop... maybe the compiler will unroll it.
    for (var i = 0; i < 3; i++) {
      // Test a horizontal and a vertical.  We'll do diagonal outside.
      checkInARow(self.grid[i][0], self.grid[i][1], self.grid[i][2]);
      checkInARow(self.grid[0][i], self.grid[1][i], self.grid[2][i]);
    }
    checkInARow(self.grid[0][0], self.grid[1][1], self.grid[2][2]);
    checkInARow(self.grid[0][2], self.grid[1][1], self.grid[2][0]);
  }

  function checkInARow(sq0, sq1, sq2) {
    if (self.big) {
      if (sq0.winner() != null && sq0.winner() == sq1.winner() && sq1.winner() == sq2.winner()) {
        _finished = true;
        _winner = sq0.winner();
      }
    } else {  
      if (sq0 != null && sq0 == sq1 && sq1 == sq2) {
        _finished = true;
        _winner = sq0;
      } 
    }
  }

  this.move = function(mark, spot) {
    // Spot is an array of 2*boardDepth, where board depth is the number of
    // levels including this one
    if (_finished) {
      throw {badmove:true, message:"This board has already been finished!"};
    }

    if (mark != 0 && mark != 1) {
      throw "Board can only mark 0's and 1's!";
    }

    if (self.big && mark != whoseTurn) {
      throw {badmove:true, message:"Not your turn!"};
    }

    if (this.big) {
      var nextBoard = this.grid[spot[0]][spot[1]];
      if (_prevCoords != undefined &&
          (_prevCoords[0] != spot[0] || _prevCoords[1] != spot[1]) &&
          !nextBoard.finished()) {
        throw {badmove:true, message:"You aren't allowed to play there!"};
      }
      nextBoard.move(mark, spot.slice(2));

      // Update whose turn it is.
      whoseTurn++;
      whoseTurn %= 2;

      _prevCoords = spot.slice(-2);

    } else {
      if (this.grid[spot[0]][spot[1]] != null) {
        throw {badmove:true, message:"Someone has already moved here!"};
      }
      this.grid[spot[0]][spot[1]] = mark;
    }

    this.emit('move', {"playerNumber":mark, "coordinates":spot});
    checkWin();
  }

  return this;
}
util.inherits(Board, EventEmitter);

module.exports = Board;
