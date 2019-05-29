const express = require('express');
const app = express();

const http = require('http').Server(app);
const PORT = 80;

// Static dir
app.use('/static', express.static('static'));

app.get('/create', function(request, response) {
    response.sendFile(__dirname + '/create.html');
});

app.get('/pod/*', function(request, response) {
    response.sendFile(__dirname + '/pod.html');
});

http.listen(PORT, '0.0.0.0', function() {
    console.log('Front server listening on ' + PORT);
});
