
"use strict";

class WebsocketListener {
    constructor(blobPort,chunkPort) {
        
        this._videoWorker = new VideoWorker(document.querySelector('video'));

        const blobWebSocket = new WebSocket(`ws://127.0.0.1:${blobPort}/`);
        blobWebSocket.onmessage = (e) => {
            console.log({blob:e.data});
            this._videoWorker.pushBlob(e.data);
        }

        const chunkWebSocket = new WebSocket(`ws://127.0.0.1:${chunkPort}/`);
        chunkWebSocket.onmessage = (e) => {
            console.log({chunk:e.data});
            this._videoWorker.pushChunk(e.data);
        }

        this._blobWebSocket = blobWebSocket;
        this._chunkWebSocket = chunkWebSocket;
    }
}