const express = require('express');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = 8765;
app.use('/static', express.static('front/src'));


app.get('/pod/*', function(request, response) {
    response.sendFile(__dirname + '/front/pod.html');
});


http.listen(PORT, '0.0.0.0', function() {
    console.log('Server listening on ' + PORT);
});


let store = {};
io.on('connection', function (socket) {
    let room_name = 'global';
    console.log('new connection');
    socket.on('join', function(msg) {
        console.log('new join:');
        socket.join(msg.pod_id);
        socket.emit('join', 'SUCCESS');
        io.sockets.in(msg.pod_id).emit("chat", "new user: " + msg.name);
        room_name = msg.pod_id;
    });

    socket.on('chat', function(msg) {
        socket.broadcast.to(room_name).emit('chat', msg);
    });
});
