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
}, {passive: false});


socket.on('create_pod_message', function(msg) {
    let result_e = document.getElementById('result');
    if (result_e.status == 'error'){
        result_e.innerHTML = 'New Pod is generated.<br />Join Pod: <a href="/pod/' + msg.new_pod_id + '">' + msg.new_pod_id +'</a>';
    } else {
        result_e.innerText = 'Pod ID is already taken. retry with dfferent ID.'
    }
});
