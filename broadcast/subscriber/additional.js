const WebSocket = require('ws');

function broadcast(wss, data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

module.exports = {
    broadcast
}