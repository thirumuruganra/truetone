# TrueTone

TrueTone is a voice-aware LinkedIn writing studio built with Next.js. It turns rough notes into polished, publish-ready drafts using your positioning, audience, tone preferences, and sample posts so the result sounds like you instead of generic AI copy.

## Features

- OAuth sign-in with Google or LinkedIn when provider keys are configured
- Voice profile setup for identity, audience, tone adjectives, phrases to use, phrases to avoid, and 2 to 5 sample posts
- Gemini-powered LinkedIn post generation from a rough draft plus saved context
- Rich editing workflow with TipTap for refining the final draft
- Character counter and one-click copy button
- Generated drafts saved in PostgreSQL with Prisma
- Request validation, body-size limits, and rate limiting on write-heavy routes
- Health endpoint for database and configuration checks

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7 with PostgreSQL
- NextAuth.js
- Google Gemini
- TipTap

## How It Works

1. Sign in.
2. Complete your voice profile in Settings.
3. Paste a rough idea into the dashboard.
4. Generate a stronger LinkedIn draft.
5. Edit the final version and copy it for publishing.

## App Routes

- `/` - Landing page and auth entry point
- `/settings` - Voice profile builder
- `/dashboard` - Drafting and generation workspace
- `/api/context` - Read and save user context
- `/api/generate` - Generate a LinkedIn post from saved context plus draft input
- `/api/health` - Health check for database and service configuration

## Getting Started

### Prerequisites

- Node.js 20 or newer
- PostgreSQL database
- Gemini API key
- Google and/or LinkedIn OAuth credentials

### Environment Variables

Create a `.env.local` file and add:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/brandvoice
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

Notes:

- If OAuth provider keys are missing, the landing page still loads and shows a setup message instead of sign-in buttons.
- For production auth deployments, also set the standard Auth.js or NextAuth environment variables required by your hosting setup.

### Installation

Run:

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Health check: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## Available Scripts

- `npm run dev` - Start local development server
- `npm run build` - Build the production app
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Create and apply Prisma migrations
- `npm run prisma:push` - Push schema changes to the database without creating a migration
- `npm run prisma:studio` - Open Prisma Studio

## API Notes

### POST /api/context

Stores the signed-in user's writing context, including:

- Identity
- Audience
- Voice adjectives
- Phrases to use
- Phrases to avoid
- Example posts

### POST /api/generate

Generates a LinkedIn post by combining:

- The user's rough draft
- The saved voice profile
- Example posts
- Prompt instructions for hook, paragraph spacing, CTA, and hashtags

The generated output is also saved as a draft record in the database.

### GET /api/health

Returns current service status for:

- Database connectivity
- Gemini configuration
- Auth provider configuration

## Deployment Notes

- Context requests are rate limited to 15 requests per minute per user and IP
- Generation requests are rate limited to 5 requests per minute per user and IP
- The current rate limiter is in-memory, so a shared store is better for multi-instance deployments
- PostgreSQL and Gemini configuration must be available at runtime for the app to function fully

## Why TrueTone

Most LinkedIn writing tools optimize for polished output. TrueTone optimizes for recognizable voice. The goal is not to sound more artificial. The goal is to sound more like yourself, only sharper.
