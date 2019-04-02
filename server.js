const http = require("http");
const url = require("url");
const fs = require('fs');
const path = require('path');

const server = http.createServer(function(req,res){

    var filename = path.join(process.cwd(), "wwwroot", url.parse(req.url).pathname);

    if(!fs.existsSync(filename)){
        res.writeHead(500, {
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
            'Content-Type': 'text/html'
        });
        res.write(file, 'utf8');

        res.end();
    });

});

/*
 *  Реализация вебсокет сервера трансляций в этом модуле
 */
const wss = require("./streaming")(server);

server.listen(8080);
console.log("Server listening http://localhost:8080/");