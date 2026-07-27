# AI Content OS 🤖

**Control your entire AI content pipeline through Telegram.**

AI Content OS is a production-ready platform that lets you create, edit, schedule, and publish AI-generated content across multiple social media platforms — all from a single Telegram chat interface.

## Architecture Overview

```
Telegram → Webhook → Next.js API → Command Parser → Command Router → AI Provider → Formatter → Telegram Response
```

## Features

- **📝 Script Generation** — Reels, YouTube, LinkedIn, Twitter threads
- **🎠 Carousel Creator** — Canva-compatible multi-slide content
- **🎨 Image Prompts** — Optimized for Midjourney / DALL-E / Stable Diffusion
- **🎬 Video Prompts** — Scene breakdowns, camera motion, transitions
- **🎙️ Voice Scripts** — SSML markup with narration timing
- **#️⃣ Smart Hashtags** — Grouped by competition level
- **💬 Caption Writer** — Hooks, body, CTAs, emojis, SEO
- **📤 Multi-Platform Publishing** — Instagram, LinkedIn, Facebook, X, Threads, YouTube
- **📅 Content Scheduling** — Schedule across platforms
- **📊 Analytics** — Track usage, costs, and performance

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict: true) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui + Radix Primitives |
| AI Providers | OpenRouter (multi-model) + Google Gemini |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma |
| Validation | Zod |
| HTTP | Axios |

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd ai-content-os
bun install
```

### 2. Set up environment variables

Copy `.env.local.example` to `.env.local` and fill in your keys:

```env
# Required
OPENROUTER_API_KEY=your_openrouter_key
TELEGRAM_TOKEN=your_telegram_bot_token

# Optional (for specific features)
GOOGLE_API_KEY=your_gemini_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_supabase_service_role
```

### 3. Run the development server

```bash
bun run dev
```

The app will be available at `http://localhost:3000`.

### 4. Set up the Telegram webhook

#### Option A: Using the built-in setup endpoint (recommended)

Make your local server accessible via [ngrok](https://ngrok.com/) and set the webhook:

```bash
ngrok http 3000
# Copy your ngrok URL (e.g. https://abc123.ngrok.io)

# Then set your webhook by calling the setup endpoint:
curl -X POST http://localhost:3000/api/setup/webhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://abc123.ngrok.io/api/telegram"}'
```

The setup endpoint also provides current webhook status via `GET /api/setup/webhook`.

#### Option B: Direct Telegram API call

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-ngrok-url.ngrok.io/api/telegram",
    "secret_token": "YOUR_WEBHOOK_SECRET",
    "allowed_updates": ["message"]
  }'
```

## Commands

### Content Creation

| Command | Description | Example |
|---------|-------------|---------|
| `/script` | Generate platform-optimized scripts | `/script\nTopic: AI Marketing\nPlatform: Instagram` |
| `/carousel` | Create carousel content (Canva-compatible) | `/carousel\nTopic: Digital Trends\nSlides: 5` |
| `/image` | Generate optimized image prompts | `/image\nPrompt: Futuristic city\nStyle: Cinematic` |
| `/video` | Create video prompts with scene breakdowns | `/video\nTopic: Product launch\nDuration: 30` |
| `/voice` | Generate voice scripts with SSML | `/voice\nScript: Welcome to our channel` |
| `/hashtags` | Generate hashtags by competition level | `/hashtags\nTopic: Digital Marketing\nCount: 30` |
| `/caption` | Write engaging captions | `/caption\nTopic: New product\nPlatform: Instagram` |

### Publishing

| Command | Description |
|---------|-------------|
| `/post` | Publish content to connected platforms |
| `/schedule` | Schedule content for future publication |

### Help

| Command | Description |
|---------|-------------|
| `/help` | Show all commands or detailed help |
| `/help <command>` | Show help for a specific command |
| `/start` | Welcome message and getting started |

### Command Format

AI Content OS supports a structured key-value format:

```
/script
Topic: Top 10 AI Tools for Students
Platform: Instagram
Duration: 60
Tone: Conversational
Language: en
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/telegram` | POST | Telegram webhook receiver |
| `/api/script` | POST | Generate scripts |
| `/api/carousel` | POST | Generate carousel content |
| `/api/image` | POST | Generate image prompts |
| `/api/video` | POST | Generate video prompts |
| `/api/voice` | POST | Generate voice scripts |
| `/api/hashtags` | POST | Generate hashtags |
| `/api/caption` | POST | Generate captions |
| `/api/publish` | POST | Publish content |
| `/api/schedule` | POST | Schedule content |
| `/api/analytics` | GET | Get analytics data |
| `/api/settings` | GET | Get configuration |
| `/api/health` | GET | Health check |

## API Response Format

All endpoints return a consistent response format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "error": null
}
```

Errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "topic: Topic is required"
  }
}
```

## AI Models

Models are centrally configured in `config/models.ts`. You can change models per task either by editing the config or setting environment variables:

| Task | Default Model | Env Variable |
|------|--------------|--------------|
| Scripts | Claude Sonnet | `MODEL_SCRIPT` |
| Image Prompts | Gemini Flash | `MODEL_IMAGE_PROMPT` |
| Carousels | Claude Sonnet | `MODEL_CAROUSEL` |
| Captions | Claude Sonnet | `MODEL_CAPTION` |
| Hashtags | Gemini Flash | `MODEL_HASHTAGS` |
| Video Prompts | Gemini Flash | `MODEL_VIDEO` |
| Voice Scripts | Claude Sonnet | `MODEL_VOICE` |
| Rewrites | Claude Sonnet | `MODEL_REWRITE` |
| Summaries | Gemini Flash | `MODEL_SUMMARIZE` |
| JSON Output | Gemini Flash | `MODEL_JSON` |

### Supported Models (via OpenRouter)

- `anthropic/claude-sonnet` — Best for complex writing
- `anthropic/claude-3.5-haiku` — Fast, cost-effective
- `google/gemini-2.5-flash` — Great for lightweight tasks
- `google/gemini-2.5-pro` — Strong general purpose
- `deepseek/deepseek-chat` — Cost-effective alternative
- `qwen/qwen-2.5-72b` — Open-source option
- `openai/gpt-4o` — Premium option
- `openai/gpt-4o-mini` — Fast, affordable

## Adding New Commands

The command system is designed for extensibility. To add a new command:

1. **Create a handler** in `lib/router/handlers/`:

```ts
// lib/router/handlers/translate.ts
import type { ParsedCommand, ApiResponse } from "@/types";
import { generateText } from "@/lib/ai/client";

export async function translateHandler(
  command: ParsedCommand,
): Promise<ApiResponse> {
  // Your handler logic here
  return {
    success: true,
    message: "Translation complete",
    data: { translated: "..." },
    error: null,
  };
}
```

2. **Register the handler** in `lib/telegram/webhook.ts`:

```ts
router.register("translate", translateHandler);
```

3. **Add command definition** in `config/commands.ts`:

```ts
{
  name: "translate",
  description: "Translate content to another language",
  usage: "/translate\nText: <content>\nLanguage: <target>",
  requiresArgs: true,
  supportsAttachments: false,
  example: "/translate\nText: Hello\nLanguage: Spanish",
}
```

No other files need to be modified. The router, parser, and formatter all work automatically.

## Project Structure

```
ai-content-os/
├── app/
│   ├── api/
│   │   ├── telegram/    # Telegram webhook
│   │   ├── script/      # Script generation
│   │   ├── carousel/    # Carousel generation
│   │   ├── image/       # Image prompts
│   │   ├── video/       # Video prompts
│   │   ├── voice/       # Voice scripts
│   │   ├── hashtags/    # Hashtag generation
│   │   ├── caption/     # Caption generation
│   │   ├── publish/     # Content publishing
│   │   ├── schedule/    # Content scheduling
│   │   ├── analytics/   # Usage analytics
│   │   ├── settings/    # Configuration
│   │   └── health/      # Health check
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── config/
│   ├── app.ts           # App configuration
│   ├── commands.ts      # Command registry
│   └── models.ts        # AI model configuration
├── lib/
│   ├── ai/
│   │   └── client.ts    # AI client (OpenRouter + Gemini)
│   ├── parser/
│   │   └── command-parser.ts
│   ├── router/
│   │   ├── command-router.ts
│   │   └── handlers/    # Command handlers
│   ├── prompts/         # Prompt templates
│   ├── telegram/        # Telegram integration
│   ├── social/          # Social media publishers
│   ├── storage/         # Supabase storage
│   ├── logger/          # Logging service
│   └── validators/      # Zod schemas
├── types/               # TypeScript type definitions
├── prisma/
│   └── schema.prisma    # Database schema
└── public/              # Static assets
```

## Deployment

### Deploy to Vercel

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Add environment variables in Vercel's dashboard
4. Deploy

### Environment Variables for Production

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for AI access |
| `TELEGRAM_TOKEN` | Yes | Telegram Bot API token |
| `TELEGRAM_WEBHOOK_SECRET` | No | Secret for webhook verification |
| `GOOGLE_API_KEY` | No | Google Gemini API key |
| `SUPABASE_URL` | No | Supabase project URL |
| `SUPABASE_SERVICE_ROLE` | No | Supabase service role key |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |

### Setting the Production Webhook

After deploying, set your Telegram bot webhook:

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.vercel.app/api/telegram",
    "secret_token": "YOUR_WEBHOOK_SECRET",
    "allowed_updates": ["message"]
  }'
```

## Development Standards

- **Strict TypeScript** (`strict: true` in tsconfig)
- **Zod validation** on all API inputs
- **Async/await** with structured error handling
- **Modular architecture** with dependency injection
- **SOLID principles** throughout
- **JSDoc documentation** on exported functions
- **Consistent API response format**

## Vercel Deployment

### 1. Connect to Vercel

```bash
# Install Vercel CLI
bun install -g vercel

# Deploy
vercel
```

Or connect your GitHub repository directly in the [Vercel dashboard](https://vercel.com).

### 2. Configure environment variables

In the Vercel dashboard, add these environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | ✅ Yes | OpenRouter API key for AI access |
| `TELEGRAM_TOKEN` | ✅ Yes | Telegram Bot API token |
| `TELEGRAM_WEBHOOK_SECRET` | 🔲 No | Secret for webhook verification |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Your Vercel deployment URL (e.g. https://ai-content-os.vercel.app) |
| `GOOGLE_API_KEY` | 🔲 No | Google Gemini API key |
| `SUPABASE_URL` | 🔲 No | Supabase project URL |
| `SUPABASE_SERVICE_ROLE` | 🔲 No | Supabase service role key |

### 3. Set the production webhook

After deploying, configure the Telegram webhook:

```bash
curl -X POST https://your-app.vercel.app/api/setup/webhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-app.vercel.app/api/telegram"}'
```

Or use the direct Telegram API:

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.vercel.app/api/telegram",
    "secret_token": "YOUR_WEBHOOK_SECRET",
    "allowed_updates": ["message"]
  }'
```

### 4. Verify the webhook

```bash
curl https://your-app.vercel.app/api/setup/webhook
```

You should see the current webhook configuration with your bot's URL.

## API Reference

### Standard Response Format

All endpoints return a consistent response:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "topic: Topic is required"
  }
}
```

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/telegram` | POST | Telegram webhook receiver |
| `/api/script` | POST | Generate platform-optimized scripts |
| `/api/carousel` | POST | Generate Canva-compatible carousel content |
| `/api/image` | POST | Generate optimized image prompts |
| `/api/video` | POST | Generate video prompts with scene breakdowns |
| `/api/voice` | POST | Generate voice/SSML scripts |
| `/api/hashtags` | POST | Generate hashtags by competition level |
| `/api/caption` | POST | Generate engaging captions |
| `/api/publish` | POST | Publish content to platforms |
| `/api/schedule` | POST | Schedule content for publication |
| `/api/analytics` | GET | Get usage analytics |
| `/api/settings` | GET | Get current configuration |
| `/api/setup/webhook` | GET/POST/DELETE | Manage Telegram webhook |
| `/api/health` | GET | Health check endpoint |

## Development Standards

- **Strict TypeScript** (`strict: true` in tsconfig)
- **Zod validation** on all API inputs
- **Async/await** with structured error handling
- **Modular architecture** with dependency injection
- **SOLID principles** throughout
- **JSDoc documentation** on exported functions
- **Consistent API response format**

## Roadmap

### ✅ Phase 1 — Core (Complete)
- Next.js project scaffold
- Telegram webhook & command system
- OpenRouter + Gemini AI integration
- /script, /hashtags, /caption, /help, /start commands
- Health check & landing page

### ✅ Phase 2 — Enhanced Content (Complete)
- /carousel with Canva-compatible JSON
- /image prompt generation
- /video with scene breakdowns
- /voice with SSML markup
- Webhook setup endpoint
- Vercel deployment config

### 🔄 Phase 3 — Publishing & Scale (Next)
- Instagram, LinkedIn, Facebook publishing
- Content scheduling engine
- Analytics dashboard
- Multi-user authentication
- Admin panel
- Team workspaces

## License

MIT
