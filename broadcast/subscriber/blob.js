const WebSocket = require('ws');
const { ping, broadcast } = require('../additional');


function init(port,chunk) {

    const wss = new WebSocket.Server({ port });

    function blobHandler(buf){
        broadcast(wss,buf);
        chunk.chunkHandler(buf,true);
    }

    setInterval(()=>ping(wss), 30000);

    return {
        wss,
        blobHandler
    }
}

module.exports = init;