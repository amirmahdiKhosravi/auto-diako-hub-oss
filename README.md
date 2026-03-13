# Auto Diako Hub

**Auto Diako Hub** is an open-source, AI-powered dealership inventory management platform built with Next.js and Supabase. It enables automotive dealerships to manage their vehicle inventory, generate professional AI-written listings, and sync inventory to Facebook Automotive Catalog — all from a single dashboard.

> **Looking for the AI Sales Agent?** The conversational AI agent that talks to customers about inventory lives in a separate repository: [auto-diako-agent-oss](https://github.com/amirmahdiKhosravi/auto-diako-agent-oss).

## Features

- **Vehicle Inventory Management** — Add, edit, and track vehicles with full details (make, model, year, mileage, trim, color, transmission, fuel type, condition, VIN, pricing)
- **AI-Powered Descriptions** — Generate professional vehicle listing descriptions using [OpenAI](https://openai.com/) (`gpt-4o`) or [Google Gemini](https://deepmind.google/technologies/gemini/) (`gemini-2.5-flash`)
- **VIN Decoding** — Automatically populate vehicle details from VIN using the NHTSA API
- **Vector Search with pgvector** — Embed vehicle data as semantic vectors stored in Supabase for intelligent search and matching
- **Facebook Automotive Catalog** — Automatically generate an XML feed to sync available inventory with Facebook Automotive Marketplace
- **Authentication** — Secure, cookie-based auth with email/password login, sign-up, password reset, and protected routes via Supabase SSR middleware
- **Progressive Web App (PWA)** — Installable on desktop and mobile with offline capability
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
- A [Supabase](https://supabase.com/) project with the pgvector extension enabled
- An [OpenAI](https://platform.openai.com/) API key (required for embeddings; also used for descriptions if chosen as provider)
- Optionally, a [Google Gemini](https://makersuite.google.com/app/apikey) API key (for description generation)

### 1. Clone the repository

```bash
git clone https://github.com/amirmahdiKhosravi/auto-diako-hub-oss.git
cd auto-diako-hub-oss
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values. See [`.env.example`](.env.example) for all available variables and descriptions.

> **Note:** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` accepts both the new **publishable** key and the legacy **anon** key. See the [Supabase announcement](https://github.com/orgs/supabase/discussions/29260) for details.
>
> LLM API keys are server-side only (no `NEXT_PUBLIC_` prefix) to keep them secure.

### 4. Set up the database

Apply the Supabase migrations in `supabase/migrations/` to your project. You can do this via the Supabase CLI or the dashboard SQL editor.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for production

```bash
npm run build && npm start
```

## Project Structure

```
auto-diako-hub-oss/
├── app/
│   ├── api/
│   │   ├── generate-description/   # AI description generation endpoint
│   │   └── facebook-catalog/       # Facebook XML feed endpoint
│   ├── auth/                       # Login, sign-up, password reset pages
│   ├── dashboard/                  # Main dashboard & sub-pages
│   │   ├── add/                   # Add vehicle form + server action
│   │   ├── ai-config/             # AI provider settings (coming soon)
│   │   ├── analytics/             # Analytics (coming soon)
│   │   ├── leads/                 # Lead management (coming soon)
│   │   └── settings/              # Dealership settings (coming soon)
│   ├── inventory/[id]/            # Vehicle detail, edit, and actions
│   ├── layout.tsx                 # Root layout (theme, fonts, metadata)
│   └── page.tsx                   # Redirects to /auth/login
├── components/
│   ├── ui/                        # shadcn/ui primitives (button, card, input, etc.)
│   ├── app-logo.tsx               # Brandable logo component
│   ├── dashboard-sidebar.tsx      # Sidebar navigation
│   ├── dashboard-content.tsx      # Inventory grid with search & stats
│   └── ...                        # Vehicle actions, auth forms, etc.
├── lib/
│   ├── llm/
│   │   ├── factory.ts             # LLM provider factory (strategy pattern)
│   │   ├── types.ts               # Shared LLM interfaces
│   │   └── providers/             # OpenAI & Gemini implementations
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   ├── server.ts              # Server Component / Server Action client
│   │   └── middleware.ts           # Middleware session refresh & auth guard
│   ├── embeddings.ts              # Vehicle vector embedding generation (OpenAI)
│   ├── vehicle-description-prompt.ts  # Shared system prompt for AI descriptions
│   └── utils.ts                   # cn() helper, env check
├── types/
│   └── vehicle.ts                 # Shared Vehicle type definition
├── supabase/
│   └── migrations/                # Database migration SQL files
├── middleware.ts                   # Next.js middleware entry point
├── public/                        # Static assets, PWA manifest & icons
└── scripts/                       # Utility scripts (icon generation)
```

## Customization

### Branding

Replace `public/app-logo.png` with your own logo. The logo component is in `components/app-logo.tsx` and is used on the login page and dashboard sidebar.

### Default Location

Set `NEXT_PUBLIC_DEFAULT_CITY`, `NEXT_PUBLIC_DEFAULT_REGION`, `NEXT_PUBLIC_DEFAULT_COUNTRY`, `NEXT_PUBLIC_DEFAULT_LATITUDE`, and `NEXT_PUBLIC_DEFAULT_LONGITUDE` in your `.env.local` to configure the fallback location for the Facebook Catalog feed.

### LLM Provider

Set `LLM_PROVIDER=openai` or `LLM_PROVIDER=gemini` to choose which model generates vehicle descriptions. See [`lib/llm/README.md`](lib/llm/README.md) for architecture details and how to add new providers.

## API Endpoints

### `POST /api/generate-description`

Generates a professional vehicle listing description using the configured LLM provider. Requires authentication.

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

Returns an XML feed of all available inventory formatted for Facebook Automotive Catalog import. Cached for 1 hour. No authentication required (public feed).

## Related Repositories

| Repository | Description |
|---|---|
| **[auto-diako-hub-oss](https://github.com/amirmahdiKhosravi/auto-diako-hub-oss)** | This repo — dealership inventory management hub |
| **[auto-diako-agent-oss](https://github.com/amirmahdiKhosravi/auto-diako-agent-oss)** | AI sales agent that converses with customers about inventory |

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the [MIT License](LICENSE).
