# 📦 Pax API – Automatiserat Bokningssystem

Detta är backend-delen av Pax – ett automatiserat bokningssystem för kontorsrum, byggt med **Express**, **TypeScript**, och **PostgreSQL**. Databasen hostas med **Neon**, och projektet är förberett för deploy med **Vercel**.

---

## 🚀 Funktionalitet

- REST API med CRUD för:
  - 🧑 Användare
  - 🏢 Rum
  - 📅 Bokningar
- JWT-baserad autentisering
- Rate limiter & error handler middleware
- Swagger-dokumentation
- Setup- och teardown-skript för databasen

---

## 📂 Projektstruktur

```
.
├── api/              # Express-app (routes, controllers, middlewares)
├── db/               # Databasanslutning (Neon)
├── scripts/          # Setup/Teardown för databasen
├── swagger/          # Swagger-specifikationer
├── vercel.json       # Vercel-konfiguration
├── .env              # Miljövariabler (lokalt)
├── tsconfig.json     # TypeScript-konfiguration
```

---

## ⚙️ Installation & Lokal utveckling

1. Klona projektet:

   ```bash
   git clone <repo-url>
   cd paxdb
   ```

2. Installera beroenden:

   ```bash
   npm install
   ```

3. Lägg till `.env` i root med:

   ```env
   DATABASE_URL=postgresql://<user>:<pass>@<host>/<db>?sslmode=require
   JWT_SECRET=superhemligt123
   CLIENT_URL=http://localhost:5173
   ```

4. Sätt upp databasen:

   ```bash
   npm run setup-db
   ```

5. Starta lokalt:

   ```bash
   npm run dev
   ```

---

## 🧪 API-dokumentation

Swagger finns tillgänglig på:

```
GET /api-docs
```

---

## 🧼 Teardown (för test eller ominstallation)

```bash
npm run teardown-db
```

---

## ☁️ Deploy på Vercel

1. Lägg till `DATABASE_URL` och `JWT_SECRET` som **Environment Variables**
2. Inga `build`- eller `output directory` behövs
3. Projektet körs via `api/index.ts` enligt `vercel.json`

---

## 📌 Notiser

- **Setup-routen (**``**) används bara i utveckling.** Du bör köra `scripts/setupDb.ts` manuellt istället.
- Projektet är förberett för att kopplas till en frontend (t.ex. Vite eller React Native).
- Om du använder Docker för lokal utveckling, lägg relaterade filer i `/docker`.

---

## 👤 Utvecklat av

Backendteamet i Chas Academy-projektet **PAX**\
Alice Eriksson med team 🧐💻

---
