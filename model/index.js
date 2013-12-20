/*
 * model/index.js
 *
 * A 'get-all' module which loads the database models
 *
 */

var user_model = require("./user.js"),
    game_model = require("./game.js"),
   board_model = require("./board.js");

module.exports = {
  "user" : user_model,
  "game" : game_model,
  "board" : board_model
}

