import "reflect-metadata";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

const server = createServer(app);

app.use(express.json({ limit: "50mb" }));

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("Socket", socket.id);
});

app.get("/", (request, response) => {
  return response.json({
    message: "Seja bem-vindo!",
  });
});

export { server, io };
