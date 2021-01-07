/* NODE-MODULES */
var express = require('express');
var app = express();
var http = require('http');
var mongoose = require('mongoose');
var debug = require('debug')('nodeapi:server');
var bodyParser = require('body-parser');
var fs = require('fs')
var path = require('path');

/* helper */
const helper = require('./lib/helper');

/* Controllers */
var userController = require('./controllers/user');

/* ROUTES */
var users = require('./routes/users');

/* connect mongodb */
mongoose.connect('mongodb://localhost/testapi', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.set('debug', true);
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true, parameterLimit: 50000 }))
app.use(express.json());


/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3001');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'public')));

/* test */
app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.use(function (req, res, next) {

    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin,Content-Type, token, x-id, Content-Length, X-Requested-With, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

app.use('/user', users);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);

    console.log("----- onListening");
}


module.exports = app;