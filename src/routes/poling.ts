import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

router.get("/polling", async (_req: Request, res: Response) => {
  console.log("⏱️ Iniciando endpoint polling (1 min de delay)...");

  await new Promise((resolve) => setTimeout(resolve, 60 * 1000)); // 1 minuto

  console.log("✅ Respondendo após delay");

  return res.json({
    message: "Resposta após 1 minuto",
  });
});

export default router;
