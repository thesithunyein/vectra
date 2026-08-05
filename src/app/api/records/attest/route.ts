import { NextResponse } from "next/server";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXkDLVxcth");

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

  const memo = [
    "VECTRA",
    recordId,
    sealHash,
    body.deviceName || "device",
    body.reason || "close",
    body.sealedBy || "user",
  ].join("|");

  try {
    const connection = new Connection(rpc, "confirmed");
    const instruction = new TransactionInstruction({
      keys: [{ pubkey: signer.publicKey, isSigner: true, isWritable: true }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memo, "utf8"),
    });
    const tx = new Transaction().add(instruction);
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
      memo,
      attester: signer.publicKey.toBase58(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Attestation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
