const WebSocket = require('ws');

function init(port,callBack){

    const wss = new WebSocket.Server({ port });

    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(buf) {
            callBack(buf);
        });
    });

    return wss;
}

module.exports = init;