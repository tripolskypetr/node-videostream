module.exports = function(blobPort,chunkPort){

    const chunk = require('./chunk')(chunkPort)
    const blob = require('./blob')(blobPort,chunk);

    return {
        blob,
        chunk
    }
}