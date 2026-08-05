import { NextResponse } from "next/server";

type BriefInput = {
  title?: string;
  severity?: string;
  driftDetected?: boolean;
  driftReason?: string;
  deviceName?: string;
  line?: string;
  status?: string;
};

function buildAssistBrief(body: BriefInput) {
  const device = body.deviceName || "Unknown machine";
  const line = body.line || "unknown line";
  const severity = body.severity || "warning";
  const drift = body.driftDetected
    ? body.driftReason || "Baseline drift detected on this line."
    : "No baseline drift flag on this alert.";

  const cause = body.driftDetected
    ? "Process drift or sensor/recipe mismatch vs recent baseline."
    : severity === "critical"
      ? "Hard fault or stop condition on the machine."
      : "Degraded performance or soft fault.";

  const action =
    severity === "critical"
      ? `Assign maintenance to ${device}, isolate ${line}, then close with reason code.`
      : `Acknowledge, inspect ${device} on ${line}, assign if fault persists.`;

  const risk =
    severity === "critical"
      ? "Unplanned downtime cost rises and shift handoff becomes disputed."
      : "Small drift can become scrap, rework, or a larger stop.";

  return [
    `What's wrong: ${body.title || "Plant alert"} on ${device} (${line}).`,
    `Likely cause: ${cause}`,
    `Recommended action: ${action}`,
    `Risk if ignored: ${risk}`,
    `Signal detail: ${drift}`,
  ].join("\n");
}

export async function POST(request: Request) {
  let body: BriefInput;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "Alert title is required." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
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

  if (apiKey) {
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

      if (res.ok) {
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const brief = data.choices?.[0]?.message?.content?.trim();
        if (brief) {
          return NextResponse.json({ brief, source: "openai" });
        }
      }
    } catch {
      // Fall through to deterministic assist brief.
    }
  }

  return NextResponse.json({
    brief: buildAssistBrief(body),
    source: "assist",
  });
}
