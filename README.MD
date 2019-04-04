# Video stream from Blob NodeJS

From [here][url]

Question:
>I am recording MediaStream on client side in this way:
> ...
> some code...
> ...
This data are accepted on server side like this:
> ...
> wss.on('connection', ws => ws.on('message', data => writeToDisk(data);
> ...
> It works like a charm, but I want to take the Buffer and make video live stream served by server side. Is there any way how to do it?
> Thanks for your help.

Answer:

You can use the MediaRecorder class to split the video into chunks and send them to the server for broadcast.

```
this._mediaRecorder = new MediaRecorder(this._stream, this._streamOptions);
this._mediaRecorder.ondataavailable = e => this._videoStreamer.pushChunk(e.data);
this._mediaRecorder.start();
...
this._mediaRecorder.requestData()
```

Do not forget to restart recording at intervals, so that new clients should not download all the video to connect to stream. Also, during the change of chunks, you should replace <video> by <image> or update video's poster so that the gluing goes smoothly.

```
async function imageBitmapToBlob(img) {
    return new Promise(res => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img,0,0);
        canvas.toBlob(res);
    });
}

...

const stream = document.querySelector('video').captureStream();

if(stream.active==true) {

    const track = stream.getVideoTracks()[0];
    const capturer = new ImageCapture(track);
    const bitmap = await imageBitmapToBlob(await capturer.grabFrame());

    URL.revokeObjectURL(this._oldPosterUrl);
    this._video.poster = this._oldPosterUrl = URL.createObjectURL(bitmap);
    track.stop();
}

```
You can glue Blob objects through their constructor. In the process of obtaining a new chunk, do not forget to clear the memory for the old video with URL.revokeObjectURL() and update video's current time
```
_updateVideo = async (newBlob = false) => {

    const stream = this._video.captureStream();

    if(stream.active==true) {

        const track = stream.getVideoTracks()[0];
        const capturer = new ImageCapture(track);
        const bitmap = await imageBitmapToBlob(await capturer.grabFrame());

        URL.revokeObjectURL(this._oldPosterUrl);
        this._video.poster = this._oldPosterUrl = URL.createObjectURL(bitmap);
        track.stop();
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

    if(newBlob === true) {
        this._recordedChunks = [blob];
    }

    this._size = blob.size;
    this._video.src = url;
    this._video.currentTime = time;
}

```
You should use two WebSocket for video broadcast and two for listening. One WebSocket transfers only video chunks, the second only new blobs with video headers (restart recording at intervals).
```

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
```
After connecting, the server sends the client all the current video blob and begins to dynamically send new chunks to the client.
```

const wss = new WebSocket.Server({ port });
let buffer = new Buffer.alloc(0);

function chunkHandler(buf,isBlob=false) {

    console.log({buf,isBlob});

    if(isBlob === true) {
        //broadcast(wss,buf);
        buffer = buf;
    } else {
        const totalLenght = buffer.length + buf.length;
        buffer = Buffer.concat([buffer,buf],totalLenght);
        broadcast(wss,buf);
    }
}

wss.on('connection', function connection(ws) {
    if(buffer.length !== 0) {
        ws.send(buffer);
    }
});
```
[url]: <https://stackoverflow.com/questions/52733539/video-stream-from-blob-nodejs/55517686#55517686>
