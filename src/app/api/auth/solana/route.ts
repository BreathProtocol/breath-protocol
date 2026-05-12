/**
 * Server-side Solana wallet auth.
 *
 * Flow:
 *   1. Client signs a deterministic message with Phantom/Solflare/etc.
 *   2. POSTs { pubkey, signature, message } here.
 *   3. We verify the ed25519 signature with @solana/web3.js (bundles nacl).
 *   4. We find-or-create a Supabase user keyed off the pubkey (admin SDK).
 *   5. We generate a one-time magic-link token and return it.
 *   6. Client calls supabase.auth.verifyOtp() with the token to attach a session.
 *
 * Why server-side: client-side signInWithPassword on a synthetic email is
 * flaky (signature collisions / bcrypt truncation / email-confirmation gate),
 * and supabase.auth.signInWithWeb3 enforces strict URI/origin checks that
 * the Phantom signIn (SIWS) message format keeps tripping. Verifying the
 * signature ourselves and minting a token via the admin API sidesteps both.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function adminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase admin env vars missing: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function syntheticEmail(pubkey: string) {
  return `sol_${pubkey.toLowerCase()}@wallet.breathprotocol.io`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pubkey, signature, message } = body as {
      pubkey?: string;
      signature?: string;
      message?: string;
    };

    if (!pubkey || !signature || !message) {
      return NextResponse.json(
        { error: "Missing pubkey, signature, or message" },
        { status: 400 }
      );
    }

    // 1. Verify the signature is a valid ed25519 sig from this pubkey.
    let pkBytes: Uint8Array;
    try {
      pkBytes = new PublicKey(pubkey).toBytes();
    } catch {
      return NextResponse.json({ error: "Invalid Solana pubkey" }, { status: 400 });
    }

    let sigBytes: Uint8Array;
    try {
      sigBytes = bs58.decode(signature);
    } catch {
      return NextResponse.json(
        { error: "Signature must be base58-encoded" },
        { status: 400 }
      );
    }

    const msgBytes = new TextEncoder().encode(message);
    const ok = nacl.sign.detached.verify(msgBytes, sigBytes, pkBytes);
    if (!ok) {
      return NextResponse.json({ error: "Bad signature" }, { status: 401 });
    }

    // 2. Find-or-create the user.
    const email = syntheticEmail(pubkey);
    const admin = adminClient();

    // Look up an existing user with this email. listUsers is paginated; for
    // a synthetic email the first page either contains them or doesn't.
    let userId: string | null = null;
    {
      // The admin API doesn't expose a "find by email" helper, so we use
      // generateLink which is idempotent-ish: it succeeds for existing users.
      const { data: existing } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      const found = existing?.users?.find((u) => u.email === email);
      if (found) userId = found.id;
    }

    if (!userId) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true, // skip confirmation
        user_metadata: {
          wallet_address: pubkey,
          chain: "solana",
          full_name: `${pubkey.slice(0, 4)}…${pubkey.slice(-4)}`,
          auth_method: "solana_wallet",
        },
      });
      if (createErr || !created?.user) {
        console.error("[api/auth/solana] createUser failed:", createErr);
        return NextResponse.json(
          { error: createErr?.message || "Failed to create user" },
          { status: 500 }
        );
      }
      userId = created.user.id;
    }

    // 3. Mint a one-time magic-link token tied to that email.
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (linkErr || !linkData?.properties) {
      console.error("[api/auth/solana] generateLink failed:", linkErr);
      return NextResponse.json(
        { error: linkErr?.message || "Failed to mint session token" },
        { status: 500 }
      );
    }

    // properties.email_otp is the 6-digit OTP code the client can verify
    // with supabase.auth.verifyOtp() to obtain a real session.
    const otp = linkData.properties.email_otp;
    if (!otp) {
      console.error("[api/auth/solana] no email_otp in generateLink response");
      return NextResponse.json(
        { error: "Session token missing from response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ email, token: otp });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e ?? "");
    console.error("[api/auth/solana] unhandled:", e);
    return NextResponse.json({ error: msg || "Internal error" }, { status: 500 });
  }
}
