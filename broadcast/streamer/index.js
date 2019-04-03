module.exports = function(blobPort,chunkPort,subscriber) {

    function blobCallback(buf) {
        subscriber.blob.blobHandler(buf);
    }

    function chunkCallback(buf) {
        subscriber.chunk.chunkHandler(buf);
    }

    const blob = require('./blob')(blobPort,blobCallback);
    const chunk = require('./chunk')(chunkPort,chunkCallback);
    
    return {
        blob,
        chunk
    }
}