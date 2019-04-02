const ws = require("ws");


const clients = {}



module.exports = function(httpServer) {

    const wss = new ws.Server({ server:httpServer });

    wss.on('connection', function connection(ws) {

        /*
         * Автор
         */
        ws.


        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
        });
        
        ws.send('something');
    });

    return wss;
};