const WebSocket = require('ws');
const { broadcast } = require('./additional');

function init(port) {

    const wss = new WebSocket.Server({ port });
    let buffer = new Buffer.alloc(0);

    function chunkHandler(buf,isBlob=false) {

        console.log({buf,isBlob});

        if(isBlob === true) {
            buffer = buf;
        } else {
            const totalLenght = buffer.length + buf.length;
            buffer = Buffer.concat([buffer,buf],totalLenght);
            broadcast(wss,buf);
        }
    }

    wss.on('connection', function connection(ws) {
        if(buffer.length !== 0) {
            ws.send(buffer);
        }
    });

    return {
        wss,
        buffer,
        chunkHandler
    }
}

module.exports = init;