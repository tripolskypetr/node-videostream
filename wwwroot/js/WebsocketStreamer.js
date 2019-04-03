
"use strict";

class WebsocketStreamer {

    constructor(blobPort,chunkPort) {
        this._videoStreamer = new VideoStreamer('video', {type:'video/webm'},{mimeType:"video/webm;codecs=H264",bitsPerSecond: 256 * 8 * 480});
        this._blobWebSocket = new WebSocket("http://127.0.0.1:"+blobPort+"/");
        this._chunkWebSocket = new WebSocket("http://127.0.0.1:"+chunkPort+"/");
        this._isStarted = false;
    }

    startAsync = async () => {

        if(this._isStarted === true) {
            throw new Error("Stream capture already started");
        }

        const initComplete = await this._videoStreamer.init();

        if(initComplete === true) {
            this._videoStreamer.onblob = (blob) => this._blobWebSocket.send(blob);
            this._videoStreamer.onchunk = (chunk) => this._blobWebSocket.send(chunk);
            await this._videoStreamer.startAsync();
            return true;
        }

        return false;
    }

    stopAsync = async () => {

        if(this._isStarted === false) {
            throw new Error("Stream capture not started");
        }

        await this._videoStreamer.stopAsync();

        this._videoStreamer.onblob = null;
        this._videoStreamer.onchunk = null;

        return true;
    }


}