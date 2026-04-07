import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../database/schema';

export const t = schema;

export const useDb = (event: any) => {
  const binding = event?.context?.cloudflare?.env?.DB;

  if (!binding) {
    throw createError({
      statusCode: 500,
      statusMessage: 'D1 binding "DB" is missing. Check wrangler.jsonc d1_databases.binding and local Cloudflare dev setup.',
    });
  }

  const db = drizzle(binding, { schema });
  return db;
};