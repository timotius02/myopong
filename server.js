//server.js

//BASE SETUP

//====================================================================
//imports 
var express = require('express'); //call express
var app = express(); //define our app using express
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var rooms = {};

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({strict: false}));

app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/app'));

var port = process.env.PORT || 8080; //set our port

//ROUTES =============================================================

var router = express.Router(); //get an instance of the express Router

//middleware to use for all request
router.use(function(req, res, next) {

    next(); //make sure we go to the next routes
});


//test route to make sure everything is working
router.get('/', function(req, res) {
    res.json({
        message: 'hooray! welcome to our api!'
    });
});



//REGISTER OUR ROUTES ------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// SOCKETS
io.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });

    socket.on('newRoom', function(data){//{id: 'id', username: 'name'}
        rooms[data.id] = [{
            name: data.username,
            angle: data.angle
        }];
        socket.join(data.id);

    });
    socket.on('joinRoom', function(data){//{id: 'id', username: 'name'}
        rooms[data.id].push({
            name: data.username,
            angle: data.angle
        });
        socket.join(data.id);

        socket.emit('playerNum', { 
            numPlayer: rooms[data.id].length
        });
    });

    socket.on('leaveRoom', function(data){// {id: 'id', username: 'name'}
        //find player instance
        for(var i = 0 ; i < rooms[data.id].length; i++){
            if( rooms[data.id][i].name === data.username){
                rooms[data.id].splice(i, 1);
            }
        }
        if(rooms[data.id] === 0){
            delete rooms[data.id];
        }
    });

    socket.on('turn', function(data){//{id: 'roomID', username: 'name', angle: 'angle'}
        io.to(data.id).emit('turn', {
            username: data.username,
            angle: data.angle
        });
    });

});

//START THE SERVER
app.listen(port);
console.log('Listening to port ' + port);
