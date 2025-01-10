import { WebSocket } from "ws";
import config from "../../config";
import { v4 as uuid } from "uuid";

const INTERVAL = 1000;

type ExtendedWebSocket = WebSocket & { isAlive?: boolean; id?: string };

const websocketServer = new WebSocket.Server({ port: config.serverPort });

const messages: [timestamp: number, message: string][] = [];

const sendMessages = (websocketClient: ExtendedWebSocket) =>
  websocketClient.send(JSON.stringify(messages.slice(-100)));

const updateClients = () => websocketServer.clients.forEach(sendMessages);

websocketServer.on("connection", (websocketClient: ExtendedWebSocket) => {
  websocketClient.id = uuid();
  sendMessages(websocketClient);

  websocketClient.on("message", (message: Buffer) => {
    messages.push([Date.now(), message.toString()]);

    updateClients();
  });

  websocketClient.on("close", () => {
    websocketClient.terminate();
  });

  websocketClient.on("pong", () => {
    websocketClient.isAlive = true;
  });
});

setInterval(() => {
  websocketServer.clients.forEach((websocketClient: ExtendedWebSocket) => {
    if (websocketClient.isAlive === false) {
      console.log(
        `Client ${websocketClient.id} disconnected due to ping timeout.`
      );
      return websocketClient.terminate();
    }

    websocketClient.isAlive = false;
    websocketClient.ping();
  });
}, INTERVAL);

console.log(
  `WebSocket server is running on ws://localhost:${config.serverPort}`
);
