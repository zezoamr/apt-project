const WebSocket = require('mock-socket').WebSocket;
const Server = require('mock-socket').Server;

test('should broadcast cursor position', done => {
  const mockServer = new Server('ws://localhost:8080');

  mockServer.on('connection', socket => {
    socket.on('message', data => {
      const message = JSON.parse(data);
      if (message.type === 'cursor') {
        mockServer.clients().forEach(client => {
          client.send(JSON.stringify({cursorPositions: message.cursorPositions, type: message.type}));
        });
      }
    });
  });

  const client1 = new WebSocket('ws://localhost:8080');
  const client2 = new WebSocket('ws://localhost:8080');

  client1.onopen = () => {
    client1.send(JSON.stringify({type: 'cursor', cursorPositions: {userid: 1, pos: 5}}));
  };

  client2.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.type === 'cursor') {
      expect(message.cursorPositions).toEqual({userid: 1, pos: 5});
      mockServer.stop(done);
    }
  };
});