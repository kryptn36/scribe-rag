# RAG Web

## Problem

Die Anwendung verarbeitet Meeting-Transkripte zu nutzbaren Arbeitsartefakten. Nutzer sollen Transkripte hochladen bzw. erfassen koennen und danach automatisch eine Zusammenfassung, Follow-up-Aufgaben, Abhaengigkeiten zwischen Aufgaben und eine durchsuchbare Wissensbasis erhalten.

## Architektur

Das Repo ist ein pnpm/Turbo-Monorepo. Die produktive App liegt in `apps/rag-web`.

```text
.
├── apps/rag-web                 # Next.js App Router Anwendung
│   ├── app                      # Routes, Layouts, API-Routen
│   ├── drizzle                  # Drizzle SQL-Migrationen
│   └── src
│       ├── entities             # Domaenentitaeten, z. B. Meeting
│       ├── features             # Nutzeraktionen wie Auth und Meeting-Verarbeitung
│       ├── shared               # Supabase, DB, AI, UI-Bausteine
│       ├── views                # Seitennahe UI-Komposition
│       └── widgets              # groessere wiederverwendbare UI-Bloecke
├── packages                     # gemeinsame Config-Pakete
└── turbo.json                   # Task-Orchestrierung
```

Technisch besteht die App aus:

- **Frontend:** Next.js App Router mit React und Tailwind-basierten UI-Komponenten.
- **Auth:** Supabase Auth ueber `@supabase/ssr`.
- **Datenbank:** Supabase Postgres, modelliert mit Drizzle ORM und Drizzle Kit.
- **AI-Pipeline:** LangChain mit OpenRouter fuer Chat-Modelle und Embeddings.
- **RAG-Daten:** Transkripte werden in Chunks geteilt, eingebettet und in einer `pgvector`-Spalte gespeichert.
- **Domaenenmodell:** Meetings, Meeting-Chunks, Follow-ups und Follow-up-Abhaengigkeiten.

## Setup

Voraussetzungen:

- Node.js `>=22`
- pnpm `10.33.1`
- Supabase-Projekt mit Postgres und Auth
- Supabase Realtime fuer die Tabelle `public.meetings` aktivieren, damit Meeting-Statusupdates in der UI live ankommen
- OpenRouter API-Key

Dependencies installieren:

```bash
pnpm install
```

Lokale Env-Datei fuer die App unter `apps/rag-web/.env.local` mit diesen Variablen erstellen:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
OPENROUTER_API_KEY=
SITE_URL=http://localhost:3000
```

Keine echten Secrets in Git committen.

## Datenbank

Neue Migrationen aus dem Drizzle-Schema erzeugen:

```bash
pnpm db:generate
```

Schema direkt gegen die konfigurierte Datenbank synchronisieren:

```bash
pnpm db:push
```

Vorhandene Migrationen ausfuehren:

```bash
pnpm db:migrate
```

Die Datenbank-URL wird aus `DATABASE_URL` gelesen. Bei Supabase sollte sie auf die Postgres-Connection des Projekts zeigen.

## Run

Entwicklungsserver starten:

```bash
pnpm dev
```

Die App laeuft standardmaessig unter:

```text
http://localhost:3000
```

Weitere nuetzliche Befehle:

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm format
```

## Design-Entscheidungen

- **Next.js App Router:** Server Actions und Server Components passen gut zur Mischung aus Auth, DB-Zugriff und UI-Workflows.
- **Drizzle:** Das Schema bleibt TypeScript-nah, Migrationen sind explizit und Supabase/Postgres-spezifische Features wie `pgvector` und Policies lassen sich gut abbilden.
- **Feature-Sliced Struktur:** UI und Logik sind nach Domaenen und Features geschnitten, statt alles global nach Dateityp zu sortieren.
- **Asynchrone Meeting-Verarbeitung:** Ein Meeting wird sofort mit Status `processing` gespeichert; Zusammenfassung, Follow-ups und Embeddings laufen danach im Hintergrund.
- **Strukturierte Follow-ups:** Aufgaben und ihre Abhaengigkeiten werden nicht nur als Text gespeichert, sondern relational modelliert, damit sie spaeter visualisiert und bearbeitet werden koennen.
