const pod_id = location.pathname.split('/').slice(-1)[0]
const socket = io();

// Join pod
socket.emit('join', {'pod_id': pod_id, 'name': 'hiroki'});
socket.on('join', function(msg){
    console.log(msg);
});


let message = document.getElementById('message')
let form = document.forms.chat;

form.submit.addEventListener('click', function(e) {
    e.preventDefault();
    socket.emit('chat', form.content.value);
    form.content.value = '';
});


socket.on('chat', function(msg) {
    let li = document.createElement('li');
    li.textContent = msg;
    message.appendChild(li);
});
