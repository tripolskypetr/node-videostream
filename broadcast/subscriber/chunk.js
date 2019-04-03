const WebSocket = require('ws');
const { ping, broadcast } = require('../additional');

function init(port) {

    const wss = new WebSocket.Server({ port });
    let buffer = new Buffer.alloc(0);

    function chunkHandler(buf,isBlob=false) {

        if(isBlob === true) {
            buffer = buf;
        } else {
            const totalLenght = buffer.length + buf.length;
            buffer = Buffer.concat([buffer,buf],totalLenght);
            broadcast(wss,buf);
        }

        wss.on('connection', function connection(ws) {
            ws.send(buffer);
        });

    }

    setInterval(()=>ping(wss), 30000);

    return {
        wss,
        buffer,
        chunkHandler
    }
}

module.exports = init;