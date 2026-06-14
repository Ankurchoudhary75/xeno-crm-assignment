# Xeno AI-Native Mini CRM

A premium, AI-powered customer relationship management suite designed to demonstrate a true "AI-native" workflow, from audience segmentation to asynchronous campaign delivery.

![Dashboard Preview](./public/window.svg)

## Features

- **Luxury SaaS Aesthetic**: A completely custom, dark-mode UI with fluid animations, glowing accents, and proportional data visualizations.
- **AI Audience Builder**: Uses the Gemini API to translate natural language prompts (e.g., *"Find me customers from New York who spent over $150"*) directly into secure, executable SQL queries.
- **Asynchronous Channel Service**: A completely decoupled, callback-driven architecture that models real-world campaign delivery (simulating `SENT` -> `DELIVERED` -> `OPENED` -> `FAILED` life cycles with realistic delays and failure rates).
- **Interactive Funnel**: The dashboard features an organic, real-time funnel that updates automatically as the webhook receipts are processed.

## Technical Architecture

The architecture is deliberately designed as a two-service, callback-driven loop to demonstrate scale and system thinking:

1. **CRM Backend (Next.js App Router)**: Handles the UI, state, AI integration, and the primary Postgres database.
2. **Channel Service Stub (`/api/channel/send`)**: When a campaign launches, it hits this endpoint asynchronously. The channel service doesn't actually send emails; it simulates the volume, ordering, and failure rates of a real messaging provider.
3. **CRM Receipt API (`/api/crm/receipt`)**: The channel service pushes statuses back to this webhook over a 15-30 second lifecycle, which updates the database and the live frontend feed.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon.tech)
- **ORM**: Prisma
- **AI**: Google Gemini 2.5 Flash (`@google/genai`)
- **Styling**: Vanilla CSS (CSS Grid, Variables, Keyframes) + Lucide Icons

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your `.env` file:
```env
DATABASE_URL="postgresql://..."
GEMINI_API_KEY="AIzaSy..."
```
4. Push the schema: `npx prisma db push`
5. Start the server: `npm run dev`
6. Click the **Seed Mock Data** button in the Settings tab to populate the database.
