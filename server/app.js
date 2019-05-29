const http = require('http').createServer();
const io = require('socket.io')(http);

const redis_client = require('redis').createClient(6379, 'kvs');

const bcrypt = require('bcrypt');
const bcrypt_salt_rounds = 12;

const PORT = 8765;


http.listen(PORT, '0.0.0.0', function() {
    console.log('Server listening on ' + PORT);
});


let store = {};
io.on('connection', function (socket) {
    let room_name = 'global';
    console.log('new connection');

    socket.on('create_pod', function(msg) {
        const pod_id = msg.pod_id;
        const password = msg.password;
        const hash = bcrypt.hashSync(password, bcrypt_salt_rounds);

        redis_client.setnx(pod_id, hash, function(err, res) {
            if (res){
                const msg = {
                    status: 'success',
                    content: 'new pod generated.',
                    new_pod_id: pod_id
                };
                socket.emit('create_pod_message', msg);
            } else {
                const msg = {
                    status: 'error',
                    content: 'Error: pod already exist.',
                    new_pod_id: ''
                };
                socket.emit('create_pod_message', msg);
            }
        });
    });

    socket.on('join', function(msg) {
        console.log('new join:');
        socket.join(msg.pod_id);
        socket.emit('join', 'SUCCESS');
        io.sockets.in(msg.pod_id).emit("info", "new user: " + msg.name);
        room_name = msg.pod_id;
    });

    socket.on('chat', function(msg) {
        socket.broadcast.to(room_name).emit('chat', msg);
    });
});
