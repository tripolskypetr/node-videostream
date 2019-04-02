
"use strict";

class VideoStreamer {


    constructor(videoSelector,blobOptions={type:"video/webm"}, streamOptions={mimeType: 'video/webm;codecs=vp9'}) {
        this._videoWorker = new VideoWorker(videoSelector,blobOptions);
        this._video = document.querySelector(videoSelector);
        this._streamOptions = streamOptions;
        this._isStreaming = false;
        this._initComplete = false;
        this._stream = null;
        this._mediaRecorder = null;
        this._onchunk = null;
        this._onblob = null;
    }

    set onchunk(_onchunk) {
        this._onchunk = _onchunk;
    }

    set onblob(_onblob) {
        this._onblob = _onblob;
    }

    init = async () => {
        this._stream = await navigator.mediaDevices.getDisplayMedia({video: true});
        if(this._stream==null) {
            this._initComplete = false;
        }
        else {
            this._mediaRecorder = new MediaRecorder(this._stream, this._streamOptions);
            this._initComplete = true;
        }
        return this._initComplete;
    }

    start = () => {

        if(this._initComplete !== true) {
            throw new Error("No MediaStream selected");
        }

        const timeout = 20000;
        const maxChunksCount = 20;
        const maxBytesCount = 15e6;

        /*
         *  chrome://blob-internals/
         */

        const blobHandler = async (e) => {
            if(this._videoWorker.chunksCount==1) debugger;
            await this._videoWorker.pushBlob(e.data);
            if(this._onblob)this._onblob(e.data);
            this._mediaRecorder.ondataavailable = chunkHandler;
            capture();
        }

        const chunkHandler = async (e) => {

            console.log({chunks:this._videoWorker.chunksCount,size:this._videoWorker.size});

            if (this._mediaRecorder.state === 'inactive' && this._isStreaming === true) {
                this._mediaRecorder.ondataavailable = undefined;
                this._mediaRecorder = new MediaRecorder(this._stream, this._streamOptions);
                this._mediaRecorder.ondataavailable = blobHandler;
                this._mediaRecorder.start();
                capture();
            }
            else if (this._videoWorker.chunksCount > maxChunksCount | this._videoWorker.size > maxBytesCount) {
                this._mediaRecorder.stop();
            } else {
                await this._videoWorker.pushChunk(e.data);
                if(this._onchunk)this._onchunk(e.data);
                capture();
            }

        }

        const capture = () => setTimeout(()=>this._mediaRecorder.requestData(),timeout);

        this._mediaRecorder.start();
        this._mediaRecorder.ondataavailable = blobHandler;
        this._isStreaming=true;

        capture();
    }

    stop = async () => {
        this._isStreaming=false;
    }

}
