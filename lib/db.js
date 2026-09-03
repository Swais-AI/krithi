// Single shared database client for the whole app — postgres.js.
//
// Each API route used to call postgres(process.env.DATABASE_URL) for itself.
// postgres.js opens up to `max` connections per client and defaults to 10, so
// nine route files meant one app could hold 90 connections against a shared
// instance that allows 79 in total across every project.
//
// Routes import this one client instead:  import { sql } from '@/lib/db';
//
// For: krithi (app/api/*), and any other Next.js app querying Postgres.

import postgres from 'postgres';

// Workers sharing this database instance — not services.
const SLOTS = Number(process.env.DB_SERVICE_SLOTS ?? 12);

// Held back for migrations, pgAdmin and the superuser reserve.
const RESERVE = Number(process.env.DB_RESERVE ?? 0.2);

// The Python version probes the server for max_connections at startup.
// postgres.js has no synchronous way to do that before the client exists, so
// it is supplied instead. Set DB_MAX_CONNECTIONS in .env to the value of
// `SHOW max_connections` on the instance this app connects to.
const MAX_CONNECTIONS = Number(process.env.DB_MAX_CONNECTIONS ?? 80);

const share = Math.max(2, Math.floor((MAX_CONNECTIONS * (1 - RESERVE)) / SLOTS));

// Reuse the client across hot reloads in development, otherwise every edit
// leaves another pool behind.
const globalForDb = globalThis;

export const sql =
  globalForDb.__sql ??
  postgres(process.env.DATABASE_URL, {
    ssl: 'require',
    // A ceiling, not a reservation — postgres.js opens connections lazily and
    // closes them again after idle_timeout.
    max: share,
    idle_timeout: 30,
    connect_timeout: 10,
    // So pg_stat_activity names this app instead of showing anonymous rows.
    connection: { application_name: process.env.DB_APP_NAME ?? 'sgs-admin' },
  });

if (process.env.NODE_ENV !== 'production') globalForDb.__sql = sql;
