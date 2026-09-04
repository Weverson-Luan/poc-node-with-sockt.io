import "dotenv/config";
import { Router } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";

import { db } from "../database";
import { users } from "../database/schema";

const router = Router();

const PG_UNIQUE_VIOLATION = "23505";
const PG_FOREIGN_KEY_VIOLATION = "23503";

const SALT_ROUNDS = 10;

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não definido nas variáveis de ambiente.");
}

function isPgError(err: unknown): err is { code?: string } {
  return typeof err === "object" && err !== null && "code" in err;
}

// remove o hash da senha antes de devolver o usuário nas respostas
function toPublicUser<T extends { password: string }>(user: T) {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}

router.post("/", async (req: Request, res: Response) => {
  const { id, name, email, password, is_logged_in, asigned_pending } = req.body as {
    id?: unknown;
    name?: unknown;
    email?: unknown;
    password?: unknown;
    is_logged_in?: unknown;
    asigned_pending?: unknown;
  };

  if (typeof id !== "string" || id.trim() === "") {
    return res
      .status(400)
      .json({
        error: "Campo id é obrigatório e deve ser uma string não vazia.",
      });
  }

  if (name !== undefined && name !== null && typeof name !== "string") {
    return res
      .status(400)
      .json({ error: "Campo name deve ser string quando informado." });
  }

  if (email !== undefined && email !== null && typeof email !== "string") {
    return res
      .status(400)
      .json({ error: "Campo email deve ser string quando informado." });
  }

  if (typeof password !== "string" || password === "") {
    return res
      .status(400)
      .json({ error: "Campo password é obrigatório e deve ser uma string não vazia." });
  }

  if (
    is_logged_in !== undefined &&
    is_logged_in !== null &&
    typeof is_logged_in !== "boolean"
  ) {
    return res
      .status(400)
      .json({ error: "Campo is_logged_in deve ser booleano quando informado." });
  }

  if (
    asigned_pending !== undefined &&
    asigned_pending !== null &&
    typeof asigned_pending !== "boolean"
  ) {
    return res
      .status(400)
      .json({ error: "Campo asigned_pending deve ser booleano quando informado." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [created] = await db
      .insert(users)
      .values({
        id: id.trim(),
        name: name === undefined || name === null ? undefined : name,
        email: email === undefined || email === null ? undefined : email,
        password: hashedPassword,
        is_logged_in: is_logged_in === undefined || is_logged_in === null ? undefined : is_logged_in,
        asigned_pending: asigned_pending === undefined || asigned_pending === null ? undefined : asigned_pending,
      })
      .returning();

    return res.status(201).json(toPublicUser(created));
  } catch (err) {
    if (isPgError(err) && err.code === PG_UNIQUE_VIOLATION) {
      return res.status(409).json({
        error: "Já existe um usuário com este id ou email.",
      });
    }
    throw err;
  }
});

router.get("/", async (_req: Request, res: Response) => {
  const rows = await db.select().from(users);
  return res.json(rows.map(toPublicUser));
});

function paramId(req: Request): string | undefined {
  const raw = req.params.id;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw[0];
  return undefined;
}

router.get("/:id", async (req: Request, res: Response) => {
  const id = paramId(req);
  if (!id) {
    return res.status(400).json({ error: "Id inválido." });
  }

  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);

  if (!row) {
    return res.status(404).json({ error: "Usuário não encontrado." });
  }

  return res.json(toPublicUser(row));
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email?: unknown;
    password?: unknown;
  };

  if (typeof email !== "string" || email.trim() === "") {
    return res
      .status(400)
      .json({ error: "Campo email é obrigatório e deve ser uma string não vazia." });
  }

  if (typeof password !== "string" || password === "") {
    return res
      .status(400)
      .json({ error: "Campo password é obrigatório e deve ser uma string não vazia." });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim()))
    .limit(1);

  // mensagem genérica em ambos os casos para não revelar se o email existe
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Credenciais inválidas." });
  }

  await db
    .update(users)
    .set({ is_logged_in: true })
    .where(eq(users.id, user.id));

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);

  return res.status(200).json({
    token,
    user: toPublicUser(user),
  });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = paramId(req);
  if (!id) {
    return res.status(400).json({ error: "Id inválido." });
  }

  try {
    const [removed] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!removed) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    return res.status(204).send();
  } catch (err) {
    if (isPgError(err) && err.code === PG_FOREIGN_KEY_VIOLATION) {
      return res.status(409).json({
        error:
          "Não é possível excluir: existem registros vinculados a este usuário (ex.: transações ou devedores).",
      });
    }
    throw err;
  }
});

export default router;
