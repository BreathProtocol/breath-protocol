# Breath Protocol — Vertebra Atlas

> Where humanity and technology becomes one.

**Vertebra Atlas** is the identity dashboard for [Breath Protocol](https://www.breath.id) — a Sybil-resistant proof-of-personhood credential that turns a single breath into lifelong proof, anchored on-chain without centralized biometric databases.

This repo holds the dashboard app: sign-in, credentials, explorer, bridge, developer portal, and the entry points into the biometric verification flow.

**Live:** <https://vertebra.breath.id>

---

## What this app does

Vertebra Atlas is the cockpit. From here a user:

- Signs in with Google, an EVM wallet, or a Solana wallet (Web3Auth)
- Opens the **biometric verification flow** ([BreathPrint](https://github.com/BreathProtocol/breathprint)) to attest their humanity
- Holds and inspects their **Proof of Personhood** credential on-chain
- Bridges credentials across supported chains
- Reads the API + developer portal documentation
- Reviews their session, wallets, connected apps, and rewards

## Stack

- **Framework:** Next.js 16 (App Router) · React 19 · TypeScript
- **Auth:** Supabase (email / Google / EVM / Solana via Web3Auth)
- **Web3:** wagmi · viem · `@solana/web3.js` (Solana sign-in)
- **Design:** Tailwind v4 · Oswald / JetBrains Mono / Cormorant Garamond · cream-and-terracotta palette (`--obsidian`, `--bone`, `--teal`)
- **Hosting:** Vercel (auto-deploy from `main` → vertebra.breath.id)

## Local development

```bash
npm install
cp .env.example .env.local   # populate Supabase + WalletConnect keys
npm run dev                  # http://localhost:3000
```

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_BYPASS_AUTH` *(set to `1` to skip the login wall locally)*

## Repository layout

```
src/app/              Next.js routes (dashboard, credentials, explorer, bridge,
                      developers, portal, rewards, discover, team)
src/components/       UI primitives, sidebar widgets, layout chrome (HUD,
                      sidebar, ambient background, cursor, top bar)
src/components/auth/  AuthProvider + Supabase glue
src/lib/              wagmi config, Web3Auth Solana provider, helpers
```

## Related projects

- **[breathprint](https://github.com/BreathProtocol/breathprint)** — the biometric verification flow (geolocation, facial, breath) that issues Zero-Knowledge proofs. Linked from the dashboard's _Verify Identity_ entry points.
- **breath-landing** — the static marketing landing at <https://www.breath.id>. Not yet open-sourced.

## Contact

`contato@breath.id`
