````markdown
# Sociarig 🚀

**One link. Endless content. In your exact voice.**

Turn a single URL, raw idea, or long-form document into a month's worth of highly aligned social media assets across X (Twitter), LinkedIn, Instagram, Threads, and email newsletters.

---

## 🌟 Features

- **Omnichannel Synthesis**: Generate format-optimized content for X threads, LinkedIn posts/carousels, Threads, Instagram captions, and newsletters simultaneously with granular variation sliders.
- **Brand Voice Cloning**: Upload past writing samples (TXT, PDF, DOCX) to extract, chunk, and embed tone vectors via background embeddings before access is unlocked.
- **Mandatory Onboarding Gate**: New users are routed into an onboarding workflow enforcing a 3-document calibration limit before dashboard access.
- **Secure SSR Auth with PKCE**: Full Supabase authentication leveraging PKCE exchange via `/auth/callback`, custom Resend SMTP delivery, and temporary disposable email protection.
- **Automated Rollback Engine**: Implements a "Reserve Upfront, Refund on Failure" pattern—if background worker handoffs fail, reserved credits are immediately refunded.
- **Idempotent Webhook Processing**: Lemon Squeezy integration backed by dedicated webhook audit tables (`webhook_events`) to prevent duplicate credit replenishment.
- **Real-Time Workspace Sync**: Realtime `postgres_changes` subscriptions update generation status, document embeddings, and credit balances instantly.
- **Adaptive Responsive UI**: Polished generation history, debounced search filters, responsive modal dialogues, and mobile-optimized action controls.

---

## 🛠️ Tech Stack

### Core Framework & UI

- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons & Notifications:** [Lucide React](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/), [Sonner](https://sonner.emilkowal.ski/)

### Data, Auth & Messaging

- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Auth with PKCE, Row-Level Security, Realtime engine)
- **State & Cache:** [TanStack Query v5](https://tanstack.com/query) (Optimistic updates, cache invalidation)
- **Email Delivery:** [Resend](https://resend.com/) (Custom SMTP provider for auth and transactional communications)
- **Bot/Disposable Protection:** `disposable-email-domains`

### Pipeline & Payments

- **Background Orchestration:** [Inngest](https://www.inngest.com/) (Step-based serverless execution, auto-retries, atomic event keys)
- **Billing & Subscriptions:** [Lemon Squeezy](https://www.lemonsqueezy.com/) (HMAC signature verification, checkout sessions, customer portal)
- **AI & Vector Embeddings:** OpenAI (`text-embedding-3-small`) & xAI (Grok)
- **Document Parsing:** `mammoth` (DOCX), `pdf2json` (PDF)

---

## 🔒 Security & Architecture

1. **PKCE Authentication Flow**: Email verification and password resets route through `/auth/callback` to exchange server tokens for authenticated session cookies before redirecting to onboarding or the workspace.
2. **Disposable Domain Filtering**: New accounts are screened against active temporary email domains prior to hitting Supabase Auth or consuming Resend delivery quota.
3. **Atomic Generation Lock & Refund Safety**: Content records are conditionally transitioned from `pending` to `processing`. Credit deductions are recorded with a pre-flight snapshot; any upstream worker failure triggers an immediate credit refund.
4. **Middleware Auth Exemption**: Internal webhook endpoints (`/api/v1/inngest`, `/api/v1/webhooks`) and auth callbacks are explicitly exempt from session redirects in `middleware.ts`.
5. **Webhook Deduplication**: Webhooks evaluate event IDs against a unique index on `webhook_events`, rejecting duplicate delivery attempts before modifying subscriber quotas.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18+ or Node.js 20+
- A Supabase project with PostgreSQL
- A Resend account (with API key)
- A Lemon Squeezy store and webhook signing secret
- An Inngest Cloud account or local Inngest CLI

---

### 1. Clone the Repository

```bash
git clone [https://github.com/yourusername/sociarig.git](https://github.com/yourusername/sociarig.git)
cd sociarig
```
````

### 2. Install Dependencies

```bash
npm install

```

### 3. Environment Variables

Create a `.env.local` file in the project root:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (Auth, DB & Storage)
NEXT_PUBLIC_SUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Inngest (Background Worker)
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# AI Providers
OPENAI_API_KEY=your_openai_api_key
XAI_API_KEY=your_xai_api_key

# Lemon Squeezy (Billing & Webhooks)
LEMON_SQUEEZY_API_KEY=your_lemonsqueezy_api_key
LEMON_SQUEEZY_STORE_ID=your_store_id
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_signing_secret

# Resend (Auth & Notifications)
RESEND_API_KEY=re_your_api_key

```

---

### 4. Supabase Configuration

#### A. Database Schema

Execute the database migrations in your Supabase SQL Editor to establish:

- `subscriptions` (User tier, credit usage counters, Lemon Squeezy references)
- `brand_voices` (Voice profiles, system prompts, onboarding completion flag)
- `voice_documents` (Uploaded training docs, chunk statuses, storage paths)
- `content_generations` (Prompts, platform outputs, generation statuses)
- `webhook_events` (Unique Lemon Squeezy event IDs for idempotency)

Ensure Row Level Security (RLS) is enabled with policies constraining reads and writes to `auth.uid() = user_id`.

#### B. Auth & SMTP Setup

1. **Authentication -> URL Configuration**:

- Set **Site URL** to `http://localhost:3000` (or your production domain).
- Add `http://localhost:3000/**` to **Redirect URLs**.

2. **Authentication -> SMTP Settings**:

- Host: `smtp.resend.com`
- Port: `587`
- Username: `resend`
- Password: `your-resend-api-key`
- Sender Email: `onboarding@resend.dev` (for local sandbox) or your verified domain.

---

### 5. Running the Application Locally

You will need three terminal windows:

**Terminal 1: Next.js Development Server**

```bash
npm run dev

```

**Terminal 2: Inngest Dev Server**

```bash
npx inngest-cli@latest dev -u http://localhost:3000/api/v1/inngest

```

Access the local Inngest dashboard at `http://localhost:8288` to inspect event triggers and background runs.

**Terminal 3: Ngrok Webhook Tunnel (For Lemon Squeezy)**

```bash
ngrok http 3000

```

Update your Lemon Squeezy Webhook URL with your ngrok forwarding address:
`https://your-tunnel.ngrok-free.app/api/v1/webhooks/lemonsqueezy`

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── (auth)/                  # Login, Signup, Reset Password routes
│   ├── api/
│   │   └── v1/
│   │       ├── generations/     # Generation submission & credit rollback logic
│   │       ├── inngest/         # Inngest edge route handler
│   │       ├── voices/          # Document upload & training ingestion
│   │       └── webhooks/        # Lemon Squeezy webhook listeners
│   ├── app/                     # Protected application area
│   │   ├── history/             # Generation history table & single view
│   │   ├── onboarding/          # Mandatory brand voice calibration
│   │   ├── settings/            # Profile & billing management
│   │   └── page.tsx             # Generation workspace
│   ├── auth/
│   │   └── callback/            # PKCE code exchange handler
│   ├── layout.tsx               # Root application layout
│   └── middleware.ts            # Route protection, onboarding gates & API bypasses
├── components/
│   ├── dashboard/               # Generator form, history views, voice uploaders
│   └── landing/                 # Public landing page sections & navigation
└── lib/
    ├── inngest/                 # Function definitions & Inngest client
    └── util/
        ├── actions/             # Server actions (auth, profile)
        ├── hooks/               # Custom hooks (useGenerator, useHistory, useOnboarding)
        └── supabase/            # Client, server, and middleware Supabase instances

```

---

## 📄 License

Copyright © 2026 Sociarig Inc. All rights reserved.

```

```
