import { Router } from "express";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

import { db } from "../database";
import { users } from "../database/schema";

const router = Router();

const PG_UNIQUE_VIOLATION = "23505";
const PG_FOREIGN_KEY_VIOLATION = "23503";

function isPgError(err: unknown): err is { code?: string } {
  return typeof err === "object" && err !== null && "code" in err;
}

router.post("/", async (req: Request, res: Response) => {
  const { id, name, email } = req.body as {
    id?: unknown;
    name?: unknown;
    email?: unknown;
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

  try {
    const [created] = await db
      .insert(users)
      .values({
        id: id.trim(),
        name: name === undefined || name === null ? undefined : name,
        email: email === undefined || email === null ? undefined : email,
      })
      .returning();

    return res.status(201).json(created);
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
  return res.json(rows);
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

  return res.json(row);
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
