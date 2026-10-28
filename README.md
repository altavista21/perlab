# Perlab (Perlindungan Abadi)

Perlab is a mobile-first prototype for exploring a social assistance application workflow: citizen assessment, dispute submission, and field-agent review.

> **Prototype notice:** This repository is not an official government service. Current screens use sample content only. There is no real identity verification, facial liveness detection, eligibility decision, payout, or persistent database integration yet. Do not enter real NIKs, face images, or bank details.

## Stage 1 scope

- Next.js App Router and TypeScript strict mode
- Tailwind CSS v3 and Lucide React
- Public landing page and separate citizen/agent navigation
- Prototype pages for login, dashboard, assessment, dispute, and agent review
- Environment-variable template without secrets

## Stage 2 foundation

- Firebase Web SDK dependency added
- Firebase client initialization module at `lib/firebase.ts`
- Cloud Firestore and Firebase Authentication clients are prepared for configuration
- Authentication must still be enabled in Firebase Console and credentials must be configured before the app can connect
- Existing forms and dashboards remain prototypes; no login, data persistence, eligibility decisions, or agent approvals are claimed to work yet

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

## Firebase configuration

1. In Firebase Console, open **Project settings → Your apps** and copy the web app configuration.
2. Copy `.env.example` to `.env.local`.
3. Fill in the `NEXT_PUBLIC_FIREBASE_*` values using the Firebase web app configuration.
4. In **Build → Authentication → Sign-in method**, enable Email/Password when ready.
5. Configure Firestore Security Rules before storing any user information.

Add the same public web configuration values to Vercel **Project Settings → Environment Variables** after the GitHub repository is connected to Vercel. These are browser configuration values, not privileged server credentials. Never commit `.env.local`, service-account private keys, passwords, or other secrets.

Firebase's web SDK is initialized in `lib/firebase.ts`. The exported `auth` and `db` values are `null` until the required environment values are present. This prevents the app from pretending it is connected when configuration is missing.

## Important security and production limitations

- NIK and NIP are identifiers, not passwords. Do not use either alone to authenticate a person.
- Client-side image hashing is not proof of facial liveness or identity.
- Do not store real identity or financial data until server-side authorization, Firestore Security Rules, audit trails, and privacy safeguards are implemented and reviewed.
- Agent permissions must be enforced by trusted server-side logic and database rules, not just by hiding UI controls.
- No Vercel deployment or production build is confirmed by this repository update.
