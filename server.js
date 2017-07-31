// server.js
const express = require('express');
const SocketServer = require('ws').Server;
const uuidv1 = require('uuid/v1');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
  // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${PORT}`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  //updates amount of clients and sends to app.jsx when a client connects
  wss.clients.forEach((client) => {
    const allUserStatus = {
      type: "incomingUserSize",
      currentUserCount: wss.clients.size,
    }
    client.send(JSON.stringify(allUserStatus))
  })
  console.log('Client connected');
  ws.on('message', function (messages) {
    const message = JSON.parse(messages)
    switch (message.type) {
      //Notifies users when users change their username
      case "postNotification":
        const userChange = {
          type: "incomingNotification",
          content: message.content,
        }
        wss.clients.forEach((client) => {
          client.send(JSON.stringify(userChange))
        });
        break;
      //Updates messagelist users type in the Chat Bar
      case "postMessage":
        const messageWithID = {
          type: "incomingMessage",
          id: uuidv1(),
          username: message.username,
          content: message.content,
        }
        wss.clients.forEach((client) => {
          client.send(JSON.stringify(messageWithID))
        });
        break;
      default:
        console.log("Error");
    }
  });
  // Set up a callback for when a client closes the socket. This usually means they closed their broconnectioner.
  ws.on('close', () => {
    //updates amount of clients and sends to app.jsx when a client disconnects
    wss.clients.forEach((client) => {
      const allUserStatus = {
        type: "incomingUserSize",
        currentUserCount: wss.clients.size,
      }
      client.send(JSON.stringify(allUserStatus))
    })
    console.log('Client disconnected')
  });
});