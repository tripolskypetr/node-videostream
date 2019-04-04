
"use strict";

class WebsocketStreamer {

    constructor(blobPort,chunkPort) {
        this._videoStreamer = new VideoStreamer('video', {type:'video/webm'},{mimeType:"video/webm;codecs=H264",bitsPerSecond: 256 * 8 * 480});
        this._blobWebSocket = new WebSocket(`ws://127.0.0.1:${blobPort}/`);
        this._chunkWebSocket = new WebSocket(`ws://127.0.0.1:${chunkPort}/`);
        this._isStarted = false;
    }

    startAsync = async () => {

        if(this._isStarted === true) {
            throw new Error("Stream capture already started");
            return;
        }

        const initComplete = await this._videoStreamer.init();

        if(initComplete === true) {
            this._videoStreamer.onblob = (blob) => {
                console.log({blob});
                this._blobWebSocket.send(blob);
            }

            this._videoStreamer.onchunk = (chunk) => {
                console.log({chunk});
                this._chunkWebSocket.send(chunk);
            }


            const p = document.createElement('p');

            p.className="bufferingText";
            p.innerText="buffering";
            document.body.appendChild(p);

            await this._videoStreamer.startAsync();

            document.body.removeChild(p);

            this._isStarted = true;
            return true;
        }

        return false;
    }

    stopAsync = async () => {

        if(this._isStarted === false) {
            throw new Error("Stream capture not started");
            return;
        }

        await this._videoStreamer.stopAsync();

        this._videoStreamer.onblob = null;
        this._videoStreamer.onchunk = null;
        this._isStarted = false;

        return true;
    }


}