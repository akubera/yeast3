/*
 *  app.js
 *
 *  Ultimate tic-tac-toe application file
 */

// First set some global variables and 
// load the configuration file
var root = global.server_root = __dirname,
  config = require('./config');

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
//     mongoStore = require('connect-mongo')(express);

// The main web application
var app = express();

// Create the http server using app
var http_server = http.createServer(app);

// Replace io with a socketio object using the new http_server
io = io.listen(http_server);

// Load database schema models
// var Models = require('schemas');
// Models.initilize();

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

  // Initialize views
  require("./views/index.js")(app);

  app.use(express.errorHandler());


});

// Default variables and functions for the renderer
function dynamic_helper(req, res, next)
{
    res.locals.scripts = ['//ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js', '/socket.io/socket.io.js'];
//     res.locals.user = req.session.user;

    if (typeof next === "function") {
        setTimeout(next, 0, null);
    }
}



// load and run socket.io things
// var socket_listener = require('sio');
// sio(io);

// Finally - start the server by listening on the ports specified in the configuration file
if (typeof config.web.host === 'undefined') {
    http_server.listen(config.web.port);
    console.log('Server running using port', config.web.port);
} else {
    http_server.listen(config.web.port, config.web.host);
    console.log('Server running at http://' + config.web.host + ':'+config.web.port);
}