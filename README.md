# Auto Diako Hub

**Auto Diako Hub** is an AI-powered dealership inventory management platform built with Next.js and Supabase. It enables automotive dealerships to manage their vehicle inventory, generate professional AI-written listings, and sync inventory to Facebook Automotive Catalog—all from a single dashboard.

## Features

- **Vehicle Inventory Management** — Add, edit, and track vehicles with full details (make, model, year, mileage, trim, color, transmission, fuel type, condition, VIN, pricing)
- **AI-Powered Descriptions** — Generate professional vehicle listing descriptions using [OpenAI](https://openai.com/) (`gpt-4o`) or [Google Gemini](https://deepmind.google/technologies/gemini/) (`gemini-2.5-flash`)
- **Vector Search with pgvector** — Embed vehicle data as semantic vectors stored in Supabase for intelligent search and matching
- **Facebook Automotive Catalog** — Automatically generate an XML feed to sync available inventory with Facebook Automotive Marketplace
- **Authentication** — Secure, cookie-based auth with email/password login, sign-up, password reset, and protected routes via Supabase SSR
- **Progressive Web App (PWA)** — Installable on desktop and mobile with offline capability
- **Dark / Light Theme** — Full theme support via `next-themes`
- **Responsive Dashboard** — Clean sidebar navigation with inventory overview, analytics, leads, and settings pages

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Database & Auth | [Supabase](https://supabase.com/) (PostgreSQL + pgvector) |
| AI / LLM | [OpenAI SDK](https://github.com/openai/openai-node) · [Google Generative AI](https://github.com/google-gemini/generative-ai-js) |
| Styling | [Tailwind CSS](https://tailwindcss.com) · [shadcn/ui](https://ui.shadcn.com/) · [Radix UI](https://www.radix-ui.com/) |
| PWA | [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa) |
| Icons | [Lucide React](https://lucide.dev/) |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project
- An [OpenAI](https://platform.openai.com/) API key and/or a [Google Gemini](https://makersuite.google.com/app/apikey) API key

### 1. Clone the repository

```bash
git clone https://github.com/amirmahdiKhosravi/auto-diako-hub.git
cd auto-diako-hub
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_or_anon_key

# LLM Provider — choose "openai" or "gemini"
LLM_PROVIDER=openai

# OpenAI (required when LLM_PROVIDER=openai)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o                          # optional
OPENAI_EMBEDDING_MODEL=text-embedding-3-small # optional

# Google Gemini (required when LLM_PROVIDER=gemini)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash                # optional

# Facebook Catalog
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_DEALER_STREET_ADDRESS=123 Main St, Mississauga, ON
```

> [!NOTE]
> `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` accepts both the new **publishable** key and the legacy **anon** key. See the [Supabase announcement](https://github.com/orgs/supabase/discussions/29260) for details.
>
> LLM API keys are server-side only (no `NEXT_PUBLIC_` prefix) to keep them secure.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
npm start
```

## Project Structure

```
auto-diako-hub/
├── app/
│   ├── api/
│   │   ├── generate-description/   # AI description generation endpoint
│   │   └── facebook-catalog/       # Facebook XML feed endpoint
│   ├── auth/                       # Login, sign-up, password reset pages
│   ├── dashboard/                  # Main dashboard & sub-pages
│   │   ├── add/                   # Add vehicle form
│   │   ├── inventory/[id]/        # Vehicle detail & edit
│   │   ├── ai-config/             # AI provider settings
│   │   ├── analytics/             # Analytics (coming soon)
│   │   ├── leads/                 # Lead management (coming soon)
│   │   └── settings/              # Dealership settings
│   ├── layout.tsx
│   └── page.tsx                   # Redirects to login
├── components/                     # Reusable React components
│   ├── ui/                        # shadcn/ui base components
│   └── ...                        # Auth, dashboard, vehicle components
├── lib/
│   ├── llm/
│   │   ├── factory.ts             # LLM provider factory
│   │   ├── types.ts               # Shared LLM interfaces
│   │   └── providers/             # OpenAI & Gemini implementations
│   ├── supabase/                  # Supabase client helpers (server, client, proxy)
│   ├── embeddings.ts              # Vehicle vector embedding generation
│   ├── vehicle-description-prompt.ts
│   └── utils.ts
├── supabase/
│   └── migrations/                # Database migration files
└── public/                        # Static assets
```

## API Endpoints

### `POST /api/generate-description`

Generates a professional vehicle listing description using the configured LLM provider.

**Request body:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "mileage": 35000,
  "trim": "XSE",
  "color": "Midnight Black",
  "transmission": "Automatic",
  "fuelType": "Gasoline",
  "condition": "Used"
}
```

**Response:**
```json
{ "description": "Discover the 2022 Toyota Camry XSE..." }
```

### `GET /api/facebook-catalog`

Returns an RSS/XML feed of all available inventory formatted for Facebook Automotive Catalog import. Cached for 1 hour.

## License

This project is private. All rights reserved.
