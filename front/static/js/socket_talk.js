const pod_id = location.pathname.split('/').slice(-1)[0];
const socketio_address = 'http://' + location.hostname + ":8765";
const socket = io(socketio_address);

// Join pod
let loginform = document.forms.login;
loginform.submit.addEventListener('click', function(e) {
    const name = loginform.name.value;
    const password = loginform.password.value;
    e.preventDefault();
    socket.emit('join', {'pod_id': pod_id, 'name': name, 'password': password});
    socket.on('join', function(msg){
        if (msg != 'SUCCESS'){
            window.alert('Something wrong.')
        }
    });
});


let timeline = document.getElementById('timeline');
let chatform = document.forms.chat;
chatform.submit.addEventListener('click', function(e) {
    const message = chatform.content.value;
    e.preventDefault();
    socket.emit('chat', message);
    chatform.content.value = '';

    // add sent text to timeline
    let li = document.createElement('li');
    li.textContent = message;
    li.className = 'mymessage';
    timeline.appendChild(li);
});


socket.on('chat', function(msg) {
    let li = document.createElement('li');
    li.textContent = '[' + msg.name + '] ' + msg.text;
    timeline.appendChild(li);
});
