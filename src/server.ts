/**
 * IMPORTS
 */
import express from "express";
import http from "http";
import cors from "cors";

import { Server } from "socket.io";
import { registerSocketEvents } from "./socket-io/socket-io";
import usersRouter from "./routes/users";
import pollingRouter from "./routes/poling";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/users", usersRouter);
app.use("/", pollingRouter);

/**
 * 🔥 ROTA DE TESTE
 */
app.get("/", (req, res) => {
  return res.status(200).json({
    status: "ok",
    message: "Servidor funcionando 🚀",
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

registerSocketEvents(io);

server.listen(3000, "0.0.0.0", () => {
  console.log("🚀 Server rodando na porta 3000 (0.0.0.0 — acessível na LAN)");
});
