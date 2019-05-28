const pod_id = location.pathname.split('/').slice(-1)[0];
const socketio_address = 'http://' + location.hostname + ":8765";
const socket = io(socketio_address);

// Join pod
socket.emit('join', {'pod_id': pod_id, 'name': 'hiroki'});
socket.on('join', function(msg){
    console.log(msg);
});


let timeline = document.getElementById('timeline');
let form = document.forms.chat;

form.submit.addEventListener('click', function(e) {
    const message = form.content.value;
    e.preventDefault();
    socket.emit('chat', message);
    form.content.value = '';

    // add sent text to timeline
    let li = document.createElement('li');
    li.textContent = message;
    li.className = 'mymessage';
    timeline.appendChild(li);
});


socket.on('chat', function(msg) {
    let li = document.createElement('li');
    li.textContent = msg;
    timeline.appendChild(li);
});
