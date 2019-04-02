
"use strict";

async function imageBitmapToBlob(img) {
    return new Promise(res => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img,0,0);
        canvas.toBlob(res);
    });
}

async function mergeBlob(blob,options) {
    const buffer = await (new Response(blob)).arrayBuffer();
    return new Blob([buffer],options);
}

class VideoWorker {

    constructor(videoSelector, options={type:"video/webm"}) {
        this._video=document.querySelector(videoSelector);
        this._recordedChunks=[];
        this._oldPosterUrl=null;
        this._oldVideoUrl=null;
        this._options=options;
        this._size=0;
        this._isUpdate=false;
    }

    get size() {
        return this._size;
    }

    get chunksCount() {
        return this._recordedChunks.length;
    }

    updateVideo = async (newBlob = false) => {

        const stream = this._video.captureStream();
            
        if(stream.active==true) {

            const track = stream.getVideoTracks()[0];
            const capturer = new ImageCapture(track);
            const bitmap = await imageBitmapToBlob(await capturer.grabFrame());

            URL.revokeObjectURL(this._oldPosterUrl);
            this._video.poster = this._oldPosterUrl = URL.createObjectURL(bitmap);
        }

        let data = null;
        if(newBlob === true) {
            const index = this._recordedChunks.length - 1;
            data = [this._recordedChunks[index]];
        } else {
            data = this._recordedChunks;
        }

        const blob = new Blob(data, this._options);
        const time = this._video.currentTime;

        URL.revokeObjectURL(this._oldVideoUrl);
        const url = this._oldVideoUrl = URL.createObjectURL(blob);

        if(newBlob) {
            this._recordedChunks = [blob];
        }

        this._size = blob.size;
        this._video.src = url;
        this._video.currentTime = time;
    }

    safeUpdateVideo = async (newBlob = false) => {

        if(this._isUpdate===true) {
            throw new Error("setInterval not supported. Use setTimeout to prevert double capture")
        }

        this._isUpdate = true;
        await this.updateVideo(newBlob);
        this._isUpdate = false;
    }

    pushChunk = async (chunk) => {  
        console.log("chunk");
        this._recordedChunks.push(chunk);
        await this.safeUpdateVideo();
    }

    pushBlob = async (blob) => {
        console.log("blob");
        this._recordedChunks.push(blob);
        await this.safeUpdateVideo(true);
    }
}