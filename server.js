const http = require("http");
const url = require("url");
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const server = http.createServer(function(req,res){

    var filename = path.join(process.cwd(), "wwwroot", url.parse(req.url).pathname);

    if(!fs.existsSync(filename)){
        res.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        res.write('404 Not Found \n');
        res.end();
        return;
    }

    if (fs.statSync(filename).isDirectory()) {
        filename += 'index.html';
    }

    fs.readFile(filename, 'utf8', function(err, file) {

        if(err) throw err;

        res.writeHead(200, {
            'Content-Type': mime.lookup(filename)
        });
        res.write(file, 'utf8');

        res.end();
    });

});

global.broadcast = require('./broadcast');

server.listen(8080);

console.log("Streamer blob websocket running ws://localhost:8081/");
console.log("Streamer chunk websocket running ws://localhost:8082/");
console.log("Subscriber blob websocket running ws://localhost:8083/");
console.log("Subscriber chunk websocket running ws://localhost:8084/");
console.log("Http server listening http://localhost:8080/");