import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 503 }
    );
  }

  let body: {
    title?: string;
    severity?: string;
    driftDetected?: boolean;
    driftReason?: string;
    deviceName?: string;
    line?: string;
    status?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "Alert title is required." }, { status: 400 });
  }

  const context = [
    `Alert: ${title}`,
    `Severity: ${body.severity ?? "unknown"}`,
    `Status: ${body.status ?? "open"}`,
    `Device: ${body.deviceName ?? "unknown"}`,
    `Line: ${body.line ?? "unknown"}`,
    `Early warning / drift: ${body.driftDetected ? "yes" : "no"}`,
    body.driftReason ? `Drift detail: ${body.driftReason}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const system = `You are Vectra, an industrial operations assistant for manufacturing plants.
Write a concise alert brief for Ops and Maintenance leads.
Output exactly 4 short lines with these labels:
What's wrong:
Likely cause:
Recommended action:
Risk if ignored:
Keep each line under 18 words. No markdown. No hype. No blockchain talk. Human stays in control.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 220,
        messages: [
          { role: "system", content: system },
          { role: "user", content: context },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: "OpenAI request failed.", detail: errText.slice(0, 240) },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const brief = data.choices?.[0]?.message?.content?.trim();
    if (!brief) {
      return NextResponse.json({ error: "Empty model response." }, { status: 502 });
    }

    return NextResponse.json({ brief });
  } catch {
    return NextResponse.json({ error: "Failed to generate brief." }, { status: 500 });
  }
}
