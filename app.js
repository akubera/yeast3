/*
 *  app.js
 *
 *  Ultimate tic-tac-toe application file
 */

// First set some global variables
var root = global.server_root = __dirname,
  use_db = true;


process.argv.forEach(function (val, index, array) {
  if (index < 2) return;
  if (val === "--nodb") {
    // TODO : Handle Databaseless server
    use_db = false;
  }
});

// Load config file - if it doesn't exist, prompt user to create one by copying the defaults
try {
  var conf = require('./config');
} catch (e) {
  console.error("\033[1;31mERROR\033[0m :", "No file config.js - please copy 'config.js.default' to 'config.js' and set the correct parameters. i.e. please run:");
  console.error("cp config.js.default config.js && $EDITOR config.js");
  return 1;
}

if (conf.web.session.secret === "") {
  console.error("Web secret not set! For your own security, please mash your keyboard to set the session.secret in the config.js file.");
  console.error("Don't forget that the database secret needs to be set as well.");
  return 1;
}
if (conf.db.opts.secret === "") {
  console.error("Database secret not set! Please mash your keyboard to set the database.opts.secret value in the config.js file.");
  return 1;
}

if (!use_db) {
  console.error("Databaseless server is not currently implemented.");
}

//
// #mark -
// #mark Module Loading
//

//////
// Use these 3rd party modules
//////
var // Express is the web application framework
    express = require('express'),

    // The app will handle http requests
    http = require('http'),

    // Use stylus for css files
    stylus = require("stylus"),

    // Nib
    nib = require('nib'),

    // For websockets
    io = require('socket.io'),

    // Mongodb abstraction
    mongoose = require('mongoose');

    // For mongo-db backed sessions
    // mongoStore = require('connect-mongo')(express);


// Load database schema models
var models = require('./model');
// var Models = require('schemas');
// Models.initilize();

// Connect to database
var db = mongoose.connect(conf.db.host, conf.db.name, conf.db.port, conf.db.opts, function (err) {
  if (err) {
    console.error("Could not connect to database", err);
    process.exit(1);
  }
  console.log("Connected to database.");
});


// The main web application
var app = express();

// Create the http server using app
var http_server = http.createServer(app);

// Replace io with a socketio object using the new http_server
io = io.listen(http_server);


//
// #mark -
// #mark Configuration
//

// Configure the Express application
app.configure(function()
{
  // set some parameters
  app.set('host', conf.web.host || "localhost");
  app.set('port', conf.web.port || "8080");

  // Log everything
  app.use(express.logger('dev'));

  // Using the jade engine - render .jade files from /templates
  app.set('views', root + '/templates');
  app.set('view engine', 'jade');

  // favicon is a 'private' resource - forward requests for it here
  app.use(express.favicon(__dirname + '/public/favicon.ico'));

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());

/// Ignore mongo stuff - we'll deal later

//    // Session Storage (store into the mongodb database - register after opening)
//  app.use(express.session({
//    secret : config.web.session.secret,
////  cookie : { maxAge : 15*60*1000}, // 15 minutes, in milliseconds
//    store: new mongoStore({
//      db: db.db,
//      collection : 'sessions'
//    })
//  }));

//    //  Use the settings in web.session to setup the session
//  app.use(express.session(config.web.session));

  // Use config
  app.use(express.session({secret : conf.web.session.secret}));

  // Using Stylus to create css from the /public/stylesheets directory
  app.use(stylus.middleware({src: __dirname + "/public", compile : function (str, path) {return stylus(str).set('filename', path).set('compress', true).use(nib());}}));

  // Serve static files from the /public folder
  app.use(express.static(__dirname + '/public'));

  // Some defaults for webpage access
  app.use(dynamic_helper);

  // use Express to route requests
  app.use(app.router);

  // report errors in a pretty way
  app.use(express.errorHandler());
});

// Default variables and functions for the renderer
function dynamic_helper(req, res, next)
{
    res.locals.scripts = ['/js/jquery-1.8.0.min.js', '/socket.io/socket.io.js'];
    res.locals.user = null; // {username : "Andy"}
//     res.locals.user = req.session.user;

    if (typeof next === "function") {
        setTimeout(next, 0, null);
    }
}

//
// #mark -
// #mark Routing
//

app.get('/', render_index);

function render_index(req, res)
{
    res.render('index', {});
    return;

//    if (req.session) {
//        res.render('index', {
//            layout: false, 
//            login_message : req.session.login_message
//        });
//        req.session.login_message = null;
//    } else {
//        res.render('index', {
//            layout: false
//        });
//    }
}

//
// #mark -
// #mark Models
//

Game = models.game;
User = models.user;

users = [];
games = {};
matchWaitee = null;

//
// #mark -
// #mark Socket.IO
//

var connection_count = 0;

// load and run socket.io things
io.sockets.on('connection', function (socket) {
	
  // increment connection count
  connection_count++;
  io.sockets.emit('connection_count', {'count' : connection_count});

  // run when user tries to set a username
  socket.on("set_user", function(data) {

    console.log("Trying to set username " + data.username);
  
    // Set username if not already set.
    if (users.indexOf(data.username) >= 0) {
      socket.emit("set_user", {"status":1, "debug": "Username already in use."});
      return;
    }

    // Set username if we don't already have one.
    socket.get("username", function(err, value) {
      if (!value) {
        socket.set("username", data.username, function() {
          socket.emit("set_user", {"status": 0, "username":data.username});
        });
      } else {
        socket.emit("set_user", {"status": 1, "debug": "You've already set a username!"});
      }
    });
  });

  socket.on("find_match", function(data) {
    // Dirt-simple matchmaking.
    socket.get("username", function(err, username) {
      if (!username) {
        socket.emit("find_match", {"status":1, "debug":"You need a username before you can enter the matchmaking queue!"});
        return;
      }

      if (matchWaitee == null) {
        console.log(username + " is waiting for a game.")
        matchWaitee = {username:username, socket:socket};
      } else {
        // If someone is already waiting, match up with them.
        console.log(username + " is going to play with " + matchWaitee.username);
        var otherPlayer = matchWaitee;
        matchWaitee = null;

        // Create new game, set up callbacks to notify each player when a move
        // has been made.
        var newGame = new Game(username, otherPlayer.username);
        newGame.on('move', function(data) {
	        otherPlayer.socket.emit("move", data);
          socket.emit("move", data);
        });

        // Keep a record of who is playing what game.
        games[otherPlayer.username] = newGame;
        games[username] = newGame;

        // Inform the players that the game has started.
        otherPlayer.socket.emit("enter_game", newGame.toJSON());
        socket.emit("enter_game", newGame.toJSON());
      }
    });
  });

  socket.on("move_made", function(data) {
    // If a user is logged in and has a game, make a move in that game.
    socket.get("username", function(err, username) {
      if (!username) {
        socket.emit("move_made", {"status":1, "debug":"Not logged in, no moves possible."});
        return;
      }

      console.log(username + " trying to move to " + data.coordinates);

      game = games[username];
      if (!game) {
        socket.emit("move_made", {"status":1, "debug":"Not in a game yet, no moves possible."});
        return;
      }

      // Make the move.
      try {
        game.move(username, data.coordinates);
      } catch (e) {
        // Catch illegal moves, tell the client about them.
        if (e.badmove) {
          socket.emit("move_made", {"status":1, "debug":e.message});
        } else {
          throw e;
        }
      }
    })
  });

  socket.on('disconnect', function () {
    connection_count--;
    io.sockets.emit('connection_count', {'count' : connection_count});
    socket.get("username", function(err,username) {
      toDelete = users.indexOf(username);
      if (toDelete >= 0) {
        users.splice(toDelete, 1);
      }
    });
  });
});

http_server.listen(app.get('port'), app.get('host'), function () {
  console.log('Express server listening on ' + app.get('host') + ':' + app.get('port'));
});
