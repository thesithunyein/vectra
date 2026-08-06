/**
 * Vectra MQTT bridge — subscribe on plant topic, forward to HTTP ingest.
 *
 * Env:
 *   VECTRA_API_KEY       — from Settings → Connect a line
 *   VECTRA_INGEST_URL    — default https://vectra.sithunyein.com/api/telemetry/ingest
 *   MQTT_BROKER_URL      — default mqtt://test.mosquitto.org:1883 (public test broker)
 *   MQTT_TOPIC           — optional; default derived from API key (vectra/plant/{slug}/telemetry)
 */

import mqtt from "mqtt";

const API_KEY = process.env.VECTRA_API_KEY;
const INGEST_URL =
  process.env.VECTRA_INGEST_URL || "https://vectra.sithunyein.com/api/telemetry/ingest";
const BROKER = process.env.MQTT_BROKER_URL || "mqtt://test.mosquitto.org:1883";

function topicFromKey(key) {
  const slug = key.replace(/^vk_/, "").slice(0, 12);
  return `vectra/plant/${slug}/telemetry`;
}

const TOPIC = process.env.MQTT_TOPIC || (API_KEY ? topicFromKey(API_KEY) : null);

if (!API_KEY) {
  console.error("Set VECTRA_API_KEY (Settings → Connect a line).");
  process.exit(1);
}
if (!TOPIC) {
  console.error("Set MQTT_TOPIC or VECTRA_API_KEY.");
  process.exit(1);
}

async function forward(payload) {
  const body = {
    deviceId: payload.deviceId,
    metric: payload.metric,
    value: Number(payload.value),
    threshold: payload.threshold != null ? Number(payload.threshold) : undefined,
    unit: payload.unit,
    source: "mqtt",
  };

  if (!body.deviceId || !body.metric || Number.isNaN(body.value)) {
    console.warn("Skip invalid payload:", payload);
    return;
  }

  const res = await fetch(INGEST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`Ingest ${res.status}:`, text);
    return;
  }
  console.log(`Forwarded ${body.deviceId}/${body.metric}=${body.value}`, text);
}

const client = mqtt.connect(BROKER);

client.on("connect", () => {
  console.log(`Connected to ${BROKER}`);
  client.subscribe(TOPIC, (err) => {
    if (err) {
      console.error("Subscribe failed:", err.message);
      process.exit(1);
    }
    console.log(`Listening on ${TOPIC} → ${INGEST_URL}`);
  });
});

client.on("message", (_topic, buf) => {
  try {
    const payload = JSON.parse(buf.toString());
    void forward(payload);
  } catch {
    console.warn("Non-JSON message ignored");
  }
});

client.on("error", (err) => console.error("MQTT error:", err.message));
