# Perlab (Perlindungan Abadi)

Perlab is a mobile-first prototype for exploring a social assistance application workflow: citizen assessment, dispute submission, and field-agent review.

> **Prototype notice:** This repository is not an official government service. Current screens use sample content only. There is no real identity verification, facial liveness detection, eligibility decision, payout, or persistent application-data integration yet. Do not enter real NIKs, face images, or bank details.

## Stage 1 scope

- Next.js App Router and TypeScript strict mode
- Tailwind CSS v3 and Lucide React
- Public landing page and separate citizen/agent navigation
- Prototype pages for login, dashboard, assessment, dispute, and agent review
- Environment-variable template without secrets

## Stage 2 foundation

- Firebase Web SDK dependency added
- Firebase client initialization module at `lib/firebase.ts`
- Citizen and agent login pages use Firebase Email/Password sign-in and check the assigned role in `users/{uid}`
- Private pages check the current Firebase session and expected role; the app shell includes sign-out
- `firestore.rules` denies database access by default and allows a signed-in user to read only their own profile document
- Login cannot work until Email/Password is enabled, web config is added, and an admin-created profile document is provisioned
- Assessment, appeal, payout, eligibility decisions, and agent approvals remain prototypes and do not persist data

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
4. In **Build → Authentication → Sign-in method**, enable Email/Password.
5. In Firestore **Rules**, publish the contents of `firestore.rules` from this repository. These rules deliberately deny access to application and appeal records until those workflows are implemented and tested.
6. In Firebase Authentication, create a test user account. Copy that account's UID, then create a Firestore document at `users/{UID}` with a single field `role` set to `citizen` for a test citizen or `agent` for an authorized test agent. Create agent accounts only for people you are authorized to designate as agents. Do not let public users assign their own roles.

Add the same public web configuration values to Vercel **Project Settings → Environment Variables** after the GitHub repository is connected to Vercel. These are browser configuration values, not privileged server credentials. Never commit `.env.local`, service-account private keys, passwords, or other secrets.

Firebase's web SDK is initialized in `lib/firebase.ts`. The exported `auth` and `db` values are `null` until the required environment values are present. This prevents the app from pretending it is connected when configuration is missing. Authentication currently uses email and password. NIK and NIP remain identity/profile fields and are not treated as passwords. This stage does not verify the real-world identity behind an account.

## Important security and production limitations

- NIK and NIP are identifiers, not passwords. Do not use either alone to authenticate a person.
- Client-side image hashing is not proof of facial liveness or identity.
- Do not store real identity or financial data until server-side authorization, Firestore Security Rules, audit trails, and privacy safeguards are implemented and reviewed.
- Agent permissions must be enforced by trusted server-side logic and database rules, not just by hiding UI controls. The current client role check is a navigation safeguard, not a substitute for rules on data operations.
- Firestore rules must be published manually in Firebase Console; adding `firestore.rules` to GitHub does not publish them automatically.
- No Vercel deployment, npm build, or automated test run is confirmed by this repository update.
