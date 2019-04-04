const WebSocket = require('ws');
const { broadcast } = require('./additional');


function init(port,chunk) {

    const wss = new WebSocket.Server({ port });

    function blobHandler(buf){
        broadcast(wss,buf);
        chunk.chunkHandler(buf,true);
    }

    return {
        wss,
        blobHandler
    }
}

module.exports = init;