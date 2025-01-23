import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  // id of the client
  console.log("Client connected");
  ws.on("message", (raw: string) => {
    const message = JSON.parse(raw);
    console.log(message);

    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === ws.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  });
});

console.log("Websocket server started on port 8080");
