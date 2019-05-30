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
    let room_name = '';
    let chat_name = '';
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
        const pod_id = msg.pod_id;
        const name = msg.name;
        const password = msg.password;

        redis_client.get(pod_id, function(err, value) {
            console.log(pod_id, name, password);
            // TODO: redisにキーがない場合の処理を書く
            if (bcrypt.compareSync(password, value)){
                console.log('login success');
                socket.join(pod_id);
                socket.emit('join', 'SUCCESS');
                io.sockets.in(pod_id).emit("info", {'status': 'new_user', 'name': name});
                room_name = pod_id;
                chat_name = name;
            } else {
                console.log('login blocked');
                socket.emit('join', 'Something wrong.');
            }
        });
    });

    socket.on('chat', function(msg) {
        const content = {
            'text': msg,
            'name': chat_name
        };
        socket.broadcast.to(room_name).emit('chat', content);
    });


    socket.on('disconnected', function() {
        if (room_name !== ''){
            io.sockets.in(pod_id).emit('info', {'status': 'out', 'name': name});
        }
    });

    let before_time = null;
    socket.on('check_alive', function(msg) {
        now = new Date();
        before_time = now.getTime() / 1000;
    });

    const loop = setInterval(function() {
        if (room_name !== '') {
            if (before_time === null) {
                const now = new Date();
                before_time = now.getTime() / 1000;  // get time (sec)
            } else {
                now = new Date();
                if ((now.getTime() / 1000) - before_time > 5) {
                    io.sockets.in(room_name).emit('info', {'status': 'out', 'name': chat_name});
                    socket.disconnect();
                    clearInterval(loop);
                }
            }
        }        
    }, 5500);
});
