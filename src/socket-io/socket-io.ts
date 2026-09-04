import { Server, Socket } from "socket.io";
import { IChatMessage } from "./interface";
import { getBotReply } from "./helpers";

type ChatMessageIn = Partial<IChatMessage> & { text?: string };

function newMessageId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const registerSocketEvents = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("🟢 Usuário conectado:", socket.id);

    socket.on("chat:message", (data: ChatMessageIn) => {
      const raw = typeof data?.text === "string" ? data.text.trim() : "";
      if (!raw) return;

      console.log("📩 Mensagem recebida:", raw);

      const now = new Date().toISOString();

      // 👉 mensagem do usuário
      const userMessage: IChatMessage = {
        id: data.id ?? newMessageId(),
        userId: data.userId ?? socket.id,
        userName: data.userName ?? "Anônimo",
        text: raw,
        createdAt: data.createdAt ?? now,
      };

      // 👉 envia só pro usuário
      socket.emit("chat:message", userMessage);

      const text = raw.toLowerCase().trim();

      // 👉 SE CONFIRMOU → ENVIA WHATSAPP
      if (text === "sim") {
        const numero = "5531982132421";

        const mensagem = encodeURIComponent(
          "Olá, gostaria de solicitar um empréstimo pelo app WsFinances 💰",
        );

        const link = `https://wa.me/${numero}?text=${mensagem}`;

        const botMessage: IChatMessage = {
          id: newMessageId(),
          userId: "server-bot",
          userName: "Assistente",
          text: `📲 Clique no link para continuar:\n${link}`,
          createdAt: new Date().toISOString(),
        };

        socket.emit("chat:message", botMessage);
        return;
      }

      // 👉 RESPOSTA NORMAL DO BOT
      const botMessage: IChatMessage = {
        id: newMessageId(),
        userId: "server-bot",
        userName: "Assistente",
        text: getBotReply(raw),
        createdAt: new Date().toISOString(),
      };

      socket.emit("chat:message", botMessage);
    });

    socket.on("disconnect", (reason: string) => {
      console.log("🔴 Usuário desconectado:", socket.id, "Motivo:", reason);
    });
  });
};
