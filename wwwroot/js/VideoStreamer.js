
"use strict";

class VideoStreamer {

    constructor(videoSelector,blobOptions={type:"video/webm"}, streamOptions={mimeType: 'video/webm;codecs=vp9'}) {
        this._video = document.querySelector(videoSelector);
        this._blobOptions = blobOptions;
        this._streamOptions = streamOptions;
        this._isStreaming = false;
        this._initComplete = false;
        this._stream = null;
        this._mediaRecorder = null;
        this._onchunk = null;
        this._onblob = null;
        this._onstop = null;
        this._onstart = null;
    }

    set onchunk(_onchunk) {
        this._onchunk = _onchunk;
    }

    set onblob(_onblob) {
        this._onblob = _onblob;
    }

    init = async () => {
        try {
            this._stream = await navigator.mediaDevices.getDisplayMedia({video: true});
            this._mediaRecorder = new MediaRecorder(this._stream, this._streamOptions);
            this._initComplete = true;
            return true;
        } catch {
            return false;
        }
    }

    startAsync = () => new Promise((resolve,reject) => {

        if(this._initComplete !== true) {
            reject(new Error("No MediaStream selected"));
            return;
        }

        if(this._isStreaming === true) {
            reject(new Error("Already streaming"));
            return;
        }

        if(this._onstart !== null) {
            reject(new Error("Last startAsync() not resolved"));
            return;
        }

        this._onstart = resolve;
        this._videoWorker = new VideoWorker(this._video,this._blobOptions);

        const timeout = 20000;
        const maxChunksCount = 20;
        const maxBytesCount = 15e6;

        const blobTimeout = 2500;

        /* chrome://blob-internals/ */

        const blobHandler = async (e) => {
            await this._videoWorker.pushBlob(e.data);
            if(this._onblob) this._onblob(e.data);
            this._mediaRecorder.ondataavailable = chunkHandler;
            capture();
        }

        const chunkHandler = async (e) => {

            if (this._mediaRecorder.state === 'inactive' && this._isStreaming === true) {
                this._mediaRecorder.ondataavailable = undefined;
                this._mediaRecorder = new MediaRecorder(this._stream, this._streamOptions);
                this._mediaRecorder.ondataavailable = blobHandler;
                this._mediaRecorder.start();
                capture(true);
            } else if(this._mediaRecorder.state === 'inactive' && this._isStreaming === false) {
                this._onstop();
                this._onstop = null;
                this._mediaRecorder = null;
                this._stream = null;
                this._videoWorker = null;
                this._initComplete = false;
            } else if (this._videoWorker.chunksCount > maxChunksCount | this._videoWorker.size > maxBytesCount | this._isStreaming === false) {
                this._mediaRecorder.stop();
            } else {
                await this._videoWorker.pushChunk(e.data);
                if(this._onchunk)this._onchunk(e.data);
                capture();
            }

        }

        const capture = (isBlob=false) => setTimeout(()=>this._mediaRecorder.requestData(),isBlob===true?blobTimeout:timeout);

        this._mediaRecorder.start();
        this._mediaRecorder.ondataavailable = (e) => {
            this._onstart();
            this._onstart = null;
            blobHandler(e);
            this._mediaRecorder.ondataavailable = blobHandler;
            this._isStreaming = true;
        };
        
        capture();
    })

    stopAsync = () => new Promise((resolve,reject)=>{

        if(this._onstop !== null) {
            reject(new Error("Last stopAsync() now resolved"));
            return;
        }

        if(this._isStreaming === false) {
            reject(new Error("Stream not started"));
            return;
        }

        this._onstop = resolve;
        this._isStreaming = false;
    })

}
