# Comandos Drizzle

Defina `DATABASE_URL` no `.env` (ex.: Postgres do `docker-compose` em `localhost:5434`).

## Gerar migration a partir do schema

Gera os arquivos SQL em `drizzle/` e atualiza `drizzle/meta/` quando você altera `src/database/schema.ts`.

```bash
npx drizzle-kit generate
```

## Aplicar migrations no banco (arquivos SQL)

Aplica em ordem os `.sql` gerados (histórico versionado). Use no dia a dia após `generate`.

```bash
npx drizzle-kit migrate
```

## Sincronizar schema sem arquivos de migration (`push`)

Envia o schema TypeScript direto para o banco, **sem** usar a pasta `drizzle/*.sql`. Útil em protótipos; em time prefira `generate` + `migrate`.

```bash
npx drizzle-kit push
```

## Drizzle Studio (inspecionar dados)

```bash
npx drizzle-kit studio
```

Abre em `http://localhost:4983` por padrão (ajuste com `--port` / `--host` se precisar).
