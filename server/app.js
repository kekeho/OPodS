const express = require('express');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = 8765;
app.use('/static', express.static('front/src'));

app.get('/', function(request, response) {
    response.sendFile(__dirname + '/front/index.html')
});


http.listen(PORT, function() {
    console.log('Server listening on ' + PORT);
})


io.on('connection', function(socket) {
    console.log('Connected');
});

