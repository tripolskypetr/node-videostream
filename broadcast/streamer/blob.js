const WebSocket = require('ws');
const { ping } = require('../additional');

function init(port,callBack){

    const wss = new WebSocket.Server({ port });

    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(buf) {
            callBack(buf);
        });
    });

    setInterval(()=>ping(wss), 30000);

    return wss;
}

module.exports = init;