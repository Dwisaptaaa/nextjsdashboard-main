# 🗂️ SETUP DATABASE UNTUK CRUDS INVOICES

## ❌ Error yang Anda Alami
```
Database Error: POSTGRES_URL not configured. Please set database 
credentials in environment variables.
```

**Penyebab:** `POSTGRES_URL` environment variable tidak di-set.

---

## ✅ Solusi Setup

### **Option 1: PostgreSQL Lokal (Recommended untuk Development)**

#### 1a. Install PostgreSQL
```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download dari https://www.postgresql.org/download/windows/
```

#### 1b. Setup Database
```bash
# Connect ke PostgreSQL
psql -U postgres

# Atau dengan password:
psql -U postgres -h localhost -p 5432 -W

# Buat database baru
CREATE DATABASE dashboard;

# Verify
\l  (list databases)
\q  (quit)
```

#### 1c. Dapatkan Connection String
```bash
# Format:
postgresql://postgres:YOUR_PASSWORD@localhost:5432/dashboard

# Contoh (tanpa password):
postgresql://postgres@localhost:5432/dashboard
```

#### 1d. Set Environment Variable
Buat atau edit file `.env.local` di root project:
```bash
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/dashboard
```

#### 1e. Jalankan Seed Script
Setelah Next.js running (`npm run dev`):
```bash
# Buka di browser:
curl http://localhost:3000/seed

# Atau langsung di browser:
http://localhost:3000/seed
```

---

### **Option 2: Vercel Postgres (Production)**

#### 2a. Create Vercel Project
1. Push project ke GitHub
2. Login ke https://vercel.com
3. Import project dari GitHub

#### 2b. Create Postgres Storage
1. Go to Storage → Create Database
2. Select "Postgres"
3. Copy `POSTGRES_URL` value

#### 2c. Set Environment Variable
Add ke Vercel Environment Variables:
```
POSTGRES_URL=<value dari step 2b>
```

#### 2d. Run Seed
Vercel akan auto-run functions, atau:
```bash
npm run build
npm start
# Buka: /seed
```

---

### **Option 3: Railway / Neon / Other Providers**

Semua provider PostgreSQL support:

#### Railway
1. New Project → Database → PostgreSQL
2. Copy `CONNECTION_URL_EXTERNAL`
3. Format: `postgresql://...`

#### Neon
1. Create Project
2. Copy `Connection string` (Pooling)
3. Format: `postgresql://...`

#### Airtable/Firebase (Tidak cocok untuk SQL)
Next.js Learn Dashboard menggunakan PostgreSQL SQL syntax. Tidak bisa pakai NoSQL.

---

## 🧪 Testing Connection

Sebelum run seed, test connection:

```bash
# Install psql client jika belum
# macOS: brew install libpq
# Linux: sudo apt-get install postgresql-client
# Windows: Install PostgreSQL with tools

# Test connection
psql POSTGRES_URL
# Jika berhasil, akan masuk ke PostgreSQL prompt
```

---

## 🚀 Full Setup Checklist

- [ ] Install PostgreSQL
- [ ] Create database `dashboard`
- [ ] Get `POSTGRES_URL` connection string
- [ ] Create `.env.local` file dengan `POSTGRES_URL=...`
- [ ] Run `npm run dev`
- [ ] Open `http://localhost:3000/seed` in browser
- [ ] Check console untuk "✅ Seeded successfully"
- [ ] Go to `http://localhost:3000/dashboard/invoices`
- [ ] Try Create Invoice (harus berhasil)

---

## 🔍 Debug Checklist

**Jika masih error "Database unavailable":**

1. ❓ Apakah `.env.local` sudah ada?
   ```bash
   cat .env.local | grep POSTGRES_URL
   ```

2. ❓ Apakah format POSTGRES_URL benar?
   ```
   ✅ postgresql://user:pass@host:5432/dbname
   ❌ postgres://  (old format)
   ❌ postgresql+psycopg2://  (sqlalchemy format)
   ```

3. ❓ Apakah database sudah running?
   ```bash
   psql -U postgres -c "SELECT version();"
   ```

4. ❓ Apakah connection string benar?
   ```bash
   psql YOUR_POSTGRES_URL
   # Jika error, connection string salah
   ```

5. ❓ Apakah restart dev server?
   ```bash
   # Kill: Ctrl+C
   # Restart: npm run dev
   # Next.js auto-reload env files
   ```

---

## 📝 Seed Schema

Seed script membuat 4 tables:

```sql
-- users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email TEXT UNIQUE,
  password TEXT
)

-- customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email TEXT,
  image_url VARCHAR(255)
)

-- invoices table (YANG KITA PAKAI)
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  customer_id UUID,
  amount INT,
  status VARCHAR(255),
  date DATE
)

-- revenue table
CREATE TABLE revenue (
  month VARCHAR(4),
  revenue INT
)
```

---

## 💡 Tips

- **Local Development:** PostgreSQL + `.env.local`
- **Production:** Vercel Postgres atau Railway
- **Test Data:** Seed script sudah include placeholder data
- **Persistent Data:** Jangan delete database antar restart
- **Connection Pooling:** Postgres library sudah handle

---

## ❓ Masih Stuck?

Check:
1. Server logs: `npm run dev` output
2. Browser DevTools → Network → see actual error
3. Verifikasi POSTGRES_URL format
4. Pastikan database already seeded

Mari debug bersama! 🚀
