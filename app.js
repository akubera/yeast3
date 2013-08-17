/*
 *  app.js
 *
 *  Ultimate tic-tac-toe application file
 */

// First set some global variables and 
// load the configuration file
var root = global.server_root = __dirname,
config = require('./config');


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
    io = require('socket.io');

    // For mongo-db backed sessions
    // mongoStore = require('connect-mongo')(express);

// The main web application
var app = express();

// Create the http server using app
var http_server = http.createServer(app);

// Replace io with a socketio object using the new http_server
io = io.listen(http_server);

// Load database schema models
// var Models = require('schemas');
// Models.initilize();


//
// #mark -
// #mark Configuration
//

// Configure the Express application
app.configure(function()
{
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
//    secret : config.session_secret,
////  cookie : { maxAge : 15*60*1000}, // 15 minutes, in milliseconds
//    store: new mongoStore({
//      db: db.db,
//      collection : 'sessions'
//    })
//  }));

  // Use config
  app.use(express.session({secret : config.session_secret}));

  // Using Stylus to create css from the /public/stylesheets directory
  app.use(stylus.middleware({src: __dirname + "/public", compile : function (str, path) {return stylus(str).set('filename', path).set('compress', true).use(nib());}}));

  // Serve static files from the /public folder
  app.use(express.static(__dirname + '/public'));

  // Some defaults for webpage access
  app.use(dynamic_helper);

  // use Express to route requests
  app.use(app.router);

  app.use(express.errorHandler());


});

// Default variables and functions for the renderer
function dynamic_helper(req, res, next)
{
    res.locals.scripts = ['//ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js', '/socket.io/socket.io.js'];
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
// #mark Model
//

Game = require("./model/game");

users = [];
games = [];
matchWaitee = null;

//
// #mark -
// #mark Socket.IO
//

// load and run socket.io things
io.sockets.on('connection', function (socket) {
  socket.on("set_user", function(data) {
    // Set username if not already set.
    if (users.indexOf(data.username) >= 0) {
      socket.emit("set_user", {"status":1, "debug": "Username already in use."});
      return;
    }

    // Set username if we don't already have one.
    socket.get("username", function(err, value) {
      if (err) {
        socket.set("username", data.username, function() {
          socket.emit("set_user", {"status": 0});
        });
      } else {
        socket.emit("set_user", {"status": 1, "debug": "You've already set a username!"});
      }
    });
  });

  socket.on("find_match", function(data) {
    // Dirt-simple matchmaking.  If nobody is waiting, save their name for later.
    socket.get("username", function(err, username) {
      if (err) {
        socket.emit("find_match", {"status":1, "debug":"You need a username before you can enter the matchmaking queue!"});
      }
      if (matchWaitee == null) {
        matchWaitee = {username:username, socket:socket};
      } else {
        var newGame = Game(username, matchWaitee.username);
        matchWaitee.socket.emit("enter_game", newGame.toJSON());
        socket.emit("enter_game", newGame.toJSON());
        matchWaitee = null;
      }
    });
  });

  socket.on("move_made", function(data) {
    
    socket.emit("move", data);
  });

  socket.on('disconnect', function () {
    socket.get("username", function(err,username) {
      toDelete = users.indexOf(username);
      if (toDelete >= 0) {
        users.splice(toDelete, 1);
      }
    });
    //io.sockets.emit('user disconnected');
  });
});

// Finally - start the server by listening on the ports specified in the configuration file
if (typeof config.web.host === 'undefined') {
    http_server.listen(config.web.port);
    console.log('Server running using port', config.web.port);
} else {
    http_server.listen(config.web.port, config.web.host);
    console.log('Server running at http://' + config.web.host + ':'+config.web.port);
}
