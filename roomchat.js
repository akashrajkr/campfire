var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var server = app.listen(3000)
var io = require('socket.io').listen(server);
//socket io setup
var votecount = 0
io.sockets.on('connection', function (socket) {
    socket.on('new-user', (room, name) => {
        socket.join(room)
        rooms[room].users[socket.id] = name
        socket.to(room).broadcast.emit('user-connected', name)
      })
      socket.on('send-chat-message', (room, message) => {
        console.log(rooms[room])
        socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
      })
      socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
          socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
          delete rooms[room].users[socket.id]
        })
      })

      socket.on('kick',(data) => {
        console.log('kick : ', data)
        var userslist = Object.values(rooms[data.room].users)
        if(userslist.includes(data.user)){
          socket.to(data.room).emit('confirm-vote', {
          user: data.user,
          room: data.room
        })
        } else {
          console.log('User does\'nt exist')
        }
        
      })
      
      socket.on('vote', data => {
        ++votecount
        console.log(votecount)
        var userslist = Object.values(rooms[data.room].users)
        console.log('userlist', userslist.length)
        if(userslist.length/2 <= votecount){
          console.log('disconnecting')
          socket.disconnect()
        }
      })

});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const rooms = {depression: {
    users:{ }
},
anxiety: {
    users: {}
} }

app.get('/', (req, res) => {
  res.render('roomhome', { rooms: rooms })
})


app.get('/:room', (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect('/')
  }

  res.render('room', { roomName: req.params.room})
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var port = 3001
app.set('port', port);
var debug = require('debug')('campfire:server');
/**
 * Create HTTP server.
 */

var server = app.listen(port);

function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
      if (room.users[socket.id] != null) names.push(name)
      return names
    }, [])
  }