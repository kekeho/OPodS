const pod_id = location.pathname.split('/').slice(-1)[0];
let myname = '';
const socketio_address = 'http://' + location.hostname + ":8765";
const socket = io(socketio_address);

function autoscroll_timeline(element) {
    element.scrollIntoView(false);
    document.forms.chat.scrollIntoView(true);
}

// Join pod
let loginform = document.forms.login;
loginform.submit.addEventListener('click', function(e) {
    let login_msg = document.getElementById('login_message');
    login_msg.innerText = '';
    myname = loginform.name.value;
    const password = loginform.password.value;
    e.preventDefault();
    socket.emit('join', {'pod_id': pod_id, 'name': myname, 'password': password});
    socket.on('join', function(msg){
        if (msg != 'SUCCESS'){
            login_msg.innerText = 'Something wrong';
        } else {
            loginform.parentNode.removeChild(loginform);  // delete self(loginform)
            document.forms.chat.hidden = false;
        }
    });
}, {passive: false});


// Send message
let timeline = document.getElementById('timeline');
let chatform = document.forms.chat;
chatform.submit.addEventListener('click', function(e) {
    const message = chatform.content.value;
    e.preventDefault();
    socket.emit('chat', message);
    chatform.content.value = '';

    let username_span = document.createElement('span');
    username_span.classList.add('name');
    username_span.innerText = myname;

    let content_span = document.createElement('span');
    content_span.classList.add('content');
    content_span.innerText = message;

    // add sent text to timeline
    let li = document.createElement('li');
    li.classList.add('mymessage', 'list-group-item');
    li.appendChild(username_span);
    li.appendChild(content_span);
    timeline.appendChild(li);

    autoscroll_timeline(li);

    chatform.content.focus();
});


// Incoming message
socket.on('chat', function(msg) {
    let li = document.createElement('li');
    li.classList.add('list-group-item');

    let username_span = document.createElement('span');
    username_span.classList.add('name');
    username_span.innerText = msg.name;

    let content_span = document.createElement('span');
    content_span.classList.add('content');
    content_span.innerText = msg.text;

    li.appendChild(username_span);
    li.appendChild(content_span);

    timeline.appendChild(li);

    autoscroll_timeline(li);
});


// imcoming info from server
socket.on('info', function(msg) {
    if (msg.status == 'new_user') {
        let li = document.createElement('li');
        li.classList.add('info_new_user');
        li.classList.add('list-group-item');
        let span = document.createElement('span');
        span.innerText = 'Join ' + msg.name;
        li.appendChild(span);

        timeline.appendChild(li);
        autoscroll_timeline(li);
    } else if (msg.status == 'out') {
        let li = document.createElement('li');
        li.classList.add('info_out_user');
        li.classList.add('list-group-item');
        let span = document.createElement('span');
        span.innerText = msg.name + ' is went out';
        li.appendChild(span);
        timeline.appendChild(li);

        autoscroll_timeline(li);
    }
});

// send alive signal
setInterval(function() {
    socket.emit('check_alive', 'alive');
}, 3000);
