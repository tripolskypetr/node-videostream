async function imageBitmapToBlob(img) {
    return new Promise(res => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img,0,0);
        canvas.toBlob(res);
    });
}

class VideoWorker {

    constructor(video) {
        this.video=document.querySelector(video);
        this.recordedChunks=[];
        this._size=0;
    }

    get size() {
        return this._size;
    }

    updateVideo = async () => {

        const stream = this.video.captureStream();
            
        if(stream.active==true) {

            const track = stream.getVideoTracks()[0];
            const capturer = new ImageCapture(track);
            const bitmap = await imageBitmapToBlob(await capturer.grabFrame());

            this.video.poster = URL.createObjectURL(bitmap);
        }

        const blob = new Blob(this.recordedChunks);
        const data = blob.slice(0,blob.lenght);
        const time = this.recordedChunks.lenght==1?0:this.video.currentTime;
        const url = URL.createObjectURL(data);

        this.recordedChunks = [data];
        this._size = data.size;

        this.video.src = url;
        this.video.currentTime = time;
    }


    /*
     * push - добавляет к текущему видео
     * append - записывает видео с нуля
     *
     * У 32 разрядного процесса ограничение памяти 4Гб - 
     * если размер UInt8Array в Blob превысит это значение
     * ебнется вкладка браузера.
     */
    pushChunk = (chunk) => {
        this.recordedChunks.push(chunk);
        this.updateVideo();
    }

    pushBlob = (blob) => {
        this.recordedChunks=[blob];
        this.updateVideo();
    }
}