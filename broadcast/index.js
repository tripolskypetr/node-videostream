
function init(){
    const subscriber = require('./subscriber')(8083,8084);
    const streamer = require('./streamer')(8081,8082,subscriber);
    
        
    return {
        streamer,
        subscriber
    }
}

module.exports = init();