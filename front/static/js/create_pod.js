const socketio_address = 'http://' + location.hostname + ":8765";
const socket = io(socketio_address);

let form = document.forms.create_pod;

form.submit.addEventListener('click', function(e) {
    e.preventDefault();
    const message = {
        pod_id: form.pod_id.value,
        password: form.password.value
    };
    socket.emit('create_pod', message);
});


socket.on('create_pod_message', function(msg) {
    let result_e = document.getElementById('result');
    result_e.innerText = msg.content + msg.new_pod_id;
});
