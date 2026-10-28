# Perlab (Perlindungan Abadi)

Perlab is a mobile-first prototype for exploring a social assistance application workflow: citizen assessment, dispute submission, and field-agent review.

> **Prototype notice:** This repository is not an official government service. Current screens use sample content only. There is no real identity verification, facial liveness detection, eligibility decision, payout, or persistent database integration yet.

## Stage 1 scope

- Next.js App Router and TypeScript strict mode
- Tailwind CSS v3 and Lucide React
- Public landing page and separate citizen/agent navigation
- Prototype pages for login, dashboard, assessment, dispute, and agent review
- Environment-variable template without secrets

## Local development

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Checks

```bash
npm run typecheck
npm run build
```

## Environment variables

Copy `.env.example` to `.env.local` for local configuration. Add actual secrets only in your local environment or the Vercel project settings. Never commit `.env.local`, database passwords, session secrets, or service-role keys.

Supabase and Prisma are not connected in Stage 1. Database setup, server-side validation, secure sessions, rate limiting, and authorization will be implemented and tested in later stages before real user data is accepted.
