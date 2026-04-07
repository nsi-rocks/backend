// server/utils/dbError.ts
export type DbError =
  | { kind: 'unique'; table?: string; column: string }
  | { kind: 'not_null'; table?: string; column: string }
  | { kind: 'foreign_key'; table?: string }
  | { kind: 'check'; constraint?: string }
  | { kind: 'constraint'; code?: number | string; message: string }
  | { kind: 'unknown'; message: string };

/**
 * Extrait la meilleure ligne d'erreur possible (sans la stack)
 */
function extractMessage(e: any): string {
  return (
    e?.cause?.message ??
    e?.message ??
    e?.cause?.cause?.message ??
    ''
  ).split('\n')[0]; // On ne garde que la première ligne (pas la stack)
}

/**
 * Supprime les guillemets/quotes autour des identifiants
 */
function unquote(s: string): string {
  return s?.replace(/^[`"'[]|[`"'\]]$/g, '') ?? s;
}

/**
 * Parse une erreur SQLite/D1/Drizzle en structure typée
 */
export function parseDbError(e: any): DbError {
  const raw = String(extractMessage(e) || '');
  const code = (e?.cause?.code ?? e?.code ?? e?.cause?.sqliteErrorCode) as any;

  // --- UNIQUE ---
  // Exemple : "UNIQUE constraint failed: users.email"
  const mUnique = /UNIQUE constraint failed:\s*([^\n|]+)/i.exec(raw);
  if (mUnique) {
    const captured = mUnique[1].trim();
    const m = /(?:(?:"?([\w$]+)"?)\.)?"?([\w$]+)"?/.exec(captured);
    return {
      kind: 'unique',
      table: m?.[1] ? unquote(m[1]) : undefined,
      column: m?.[2] ? unquote(m[2]) : captured,
    };
  }

  // --- NOT NULL ---
  // Exemple : "NOT NULL constraint failed: users.name"
  const mNotNull = /NOT NULL constraint failed:\s*([^\n|]+)/i.exec(raw);
  if (mNotNull) {
    const captured = mNotNull[1].trim();
    const m = /(?:(?:"?([\w$]+)"?)\.)?"?([\w$]+)"?/.exec(captured);
    return {
      kind: 'not_null',
      table: m?.[1] ? unquote(m[1]) : undefined,
      column: m?.[2] ? unquote(m[2]) : captured,
    };
  }

  // --- FOREIGN KEY ---
  // Exemple : "FOREIGN KEY constraint failed"
  if (/FOREIGN KEY constraint failed/i.test(raw)) {
    return { kind: 'foreign_key' };
  }

  // --- CHECK ---
  // Exemple : "CHECK constraint failed: my_constraint"
  const mCheck = /CHECK constraint failed(?::\s*([\w$]+))?/i.exec(raw);
  if (mCheck) {
    return {
      kind: 'check',
      constraint: mCheck[1] ? unquote(mCheck[1]) : undefined,
    };
  }

  // --- CONTRAINTE GÉNÉRIQUE ---
  // SQLite code 19 = SQLITE_CONSTRAINT
  if (raw.includes('SQLITE_CONSTRAINT') || code === 19) {
    return { kind: 'constraint', code: code ?? 19, message: raw };
  }

  // --- FALLBACK ---
  return { kind: 'unknown', message: raw || 'Unknown database error' };
}