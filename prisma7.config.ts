import { config } from 'dotenv';
import { defineConfig } from "@prisma/config";

// Legge il file corretto e FORZA la sovrascrittura di eventuali vecchie variabili
config({ path: '.env.local', override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
