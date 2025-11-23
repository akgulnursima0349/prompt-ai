# PromptAI - AI API Builder Platform

Dogal dil ile AI API'leri olusturun. Kod yazmadan, dakikalar icinde.

## Ozellikler

- **Aninda API Olusturma**: Prompt yazin, saniyeler icinde production-ready API alin
- **Kod Gerektirmez**: Backend, hosting, scaling... Hepsini biz hallederiz
- **Guvenli & Olceklenebilir**: API key yonetimi, rate limiting ve enterprise-grade guvenlik
- **Akilli Oneri**: AI, prompt'unuza gore en uygun yapilandirmayi otomatik oner

## Teknolojiler

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui komponentleri
- Framer Motion

### Backend
- Next.js API Routes
- Prisma ORM
- SQLite (gelistirme) / PostgreSQL (production)

### AI
- Groq API (Llama 3.1 70B)

## Kurulum

### Gereksinimler

- Node.js 18+
- pnpm 8+

### Adimlar

1. **pnpm'i yukleyin** (eger yoksa):
```bash
npm install -g pnpm
```

2. **Proje dizinine gidin**:
```bash
cd C:\Projects\prompt-ai
```

3. **Bagimliliklari yukleyin**:
```bash
pnpm install
```

4. **Veritabanini olusturun**:
```bash
pnpm db:push
```

5. **Gelistirme sunucusunu baslatin**:
```bash
pnpm dev
```

6. **Tarayicinizda acin**: http://localhost:3000

## Proje Yapisi

```
prompt-ai/
├── apps/
│   └── web/                 # Next.js frontend & API
│       ├── src/
│       │   ├── app/         # App Router sayfalari
│       │   ├── components/  # React komponentleri
│       │   └── lib/         # Yardimci fonksiyonlar
│       └── ...
├── packages/
│   ├── database/            # Prisma schema & client
│   └── shared/              # Ortak tipler ve utils
├── .env                     # Environment degiskenleri
└── turbo.json              # Turborepo konfigurasyon
```

## Environment Degiskenleri

`.env` dosyasindaki onemli degiskenler:

```env
# Veritabani
DATABASE_URL="file:./dev.db"

# AI Model
GROQ_API_KEY="your_groq_api_key"

# Auth
NEXTAUTH_SECRET="your_secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Kullanim

### 1. Kayit Olun
- http://localhost:3000/register adresinden hesap olusturun

### 2. API Olusturun
- Dashboard'dan "Yeni API Olustur" butonuna tiklayin
- Prompt'unuzu yazin (ornek: "Musteri yorumlarini analiz eden bir API olustur")
- AI'nin olusturacagi yapiyi inceleyin ve onaylayin
- API Key'inizi alin

### 3. API'yi Kullanin
```bash
curl -X POST http://localhost:3000/api/v1/your-api-slug \
  -H "Authorization: Bearer pak_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"text": "Bu urun harika!"}'
```

## Gelistirme

```bash
# Tum servisleri baslat
pnpm dev

# Sadece web
pnpm --filter @prompt-ai/web dev

# Prisma Studio (veritabani yonetimi)
pnpm db:studio

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Lisans

MIT
