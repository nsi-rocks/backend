# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## D1 Local Workflow

The D1 binding is configured with `remote: false` in `wrangler.jsonc` so local dev does not hit the remote database by default.

Run dev server against remote D1 ponctually:

```bash
pnpm dev:remote
```

This uses Nuxt `--envName remote` and points `nitro-cloudflare-dev` to `wrangler.remote.jsonc`.

No config file swap is performed.

Clone remote database into local persisted D1 state:

```bash
pnpm d1:clone:remote-to-local
```

Apply pending migrations on local D1:

```bash
pnpm drizzle:push:local
```

Create a remote backup `.sql` file:

```bash
pnpm d1:backup:remote
```

Optional custom output for backup:

```bash
pnpm d1:backup:remote ./backups/d1/manual-backup.sql
```

Useful environment variables:

- `D1_DB_NAME` (default: `nsi-rocks`)
- `D1_BACKUP_DIR` (default: `./backups/d1`)
- `D1_PERSIST_DIR` (default: `./.wrangler/state`)
- `D1_EXPORT_MAX_RETRIES` (default: `3`)

### Regular Backup Example (cron)

Run `crontab -e` and add:

```cron
0 */6 * * * cd /Users/mathieu/code/nsi-rocks/backend && /opt/homebrew/bin/pnpm d1:backup:remote >> /Users/mathieu/code/nsi-rocks/backend/backups/d1/cron.log 2>&1
```

This example creates one backup every 6 hours.
