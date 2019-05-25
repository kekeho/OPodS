const sock = new WebSocket('ws:localhost:8765');

let send_button = document.getElementById('send');
send_button.addEventListener('click', function (e) {
    let text = document.getElementById('text').value;
    sock.send(text);
});


let resp_div = document.getElementById('resp');
sock.onmessage = function (e) {
    resp_div.innerText = e.data;
    sock.close();
};

