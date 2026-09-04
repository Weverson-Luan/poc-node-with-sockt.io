interface IChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export type { IChatMessage };
