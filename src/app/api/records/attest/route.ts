import { NextResponse } from "next/server";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

function loadKeypair(): Keypair | null {
  const raw = process.env.SOLANA_SECRET_KEY;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as number[];
    return Keypair.fromSecretKey(Uint8Array.from(parsed));
  } catch {
    return null;
  }
}

function seedFromHash(sealHash: string, recordId: string) {
  // createWithSeed allows max 32 bytes
  const raw = `${recordId}-${sealHash}`.replace(/[^a-zA-Z0-9]/g, "");
  return raw.slice(0, 32);
}

export async function POST(request: Request) {
  const signer = loadKeypair();
  if (!signer) {
    return NextResponse.json(
      { error: "SOLANA_SECRET_KEY is not configured on the server." },
      { status: 503 }
    );
  }

  let body: {
    sealHash?: string;
    recordId?: string;
    sealedBy?: string;
    deviceName?: string;
    reason?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const sealHash = body.sealHash?.trim();
  const recordId = body.recordId?.trim();
  if (!sealHash || !recordId) {
    return NextResponse.json(
      { error: "sealHash and recordId are required." },
      { status: 400 }
    );
  }

  const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "devnet";
  const rpc =
    process.env.SOLANA_RPC_URL ||
    (cluster === "mainnet-beta"
      ? "https://api.mainnet-beta.solana.com"
      : "https://api.devnet.solana.com");

  try {
    const connection = new Connection(rpc, "confirmed");
    const seed = seedFromHash(sealHash, recordId);
    const attestationAccount = await PublicKey.createWithSeed(
      signer.publicKey,
      seed,
      SystemProgram.programId
    );

    const lamports = await connection.getMinimumBalanceForRentExemption(0);
    const info = await connection.getAccountInfo(attestationAccount);

    const tx = new Transaction();
    if (!info) {
      tx.add(
        SystemProgram.createAccountWithSeed({
          fromPubkey: signer.publicKey,
          basePubkey: signer.publicKey,
          seed,
          newAccountPubkey: attestationAccount,
          lamports,
          space: 0,
          programId: SystemProgram.programId,
        })
      );
    } else {
      // Account already exists for this seal — still emit a tiny self-proof transfer
      tx.add(
        SystemProgram.transfer({
          fromPubkey: signer.publicKey,
          toPubkey: signer.publicKey,
          lamports: 0,
        })
      );
    }

    // Prefer a no-op when account exists: 0-lamport self transfer can fail on some RPCs.
    // Re-create path is the common case for new seals.
    if (info) {
      return NextResponse.json({
        signature: "existing",
        explorerUrl: `https://explorer.solana.com/address/${attestationAccount.toBase58()}?cluster=${
          cluster === "mainnet-beta" ? "mainnet-beta" : "devnet"
        }`,
        cluster,
        sealHash,
        attestationAccount: attestationAccount.toBase58(),
        attester: signer.publicKey.toBase58(),
        existing: true,
      });
    }

    const signature = await sendAndConfirmTransaction(connection, tx, [signer], {
      commitment: "confirmed",
    });

    const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=${
      cluster === "mainnet-beta" ? "mainnet-beta" : "devnet"
    }`;

    return NextResponse.json({
      signature,
      explorerUrl,
      cluster,
      sealHash,
      attestationAccount: attestationAccount.toBase58(),
      attester: signer.publicKey.toBase58(),
      sealedBy: body.sealedBy,
      deviceName: body.deviceName,
      reason: body.reason,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Attestation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
