function ping(wss) {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) return ws.terminate();
  
      ws.isAlive = false;
      ws.ping(noop);
    });
}

function broadcast(wss, data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.sendBytes(data);
      }
    });
}

module.exports = {
    ping,
    broadcast
}