# Vectra MQTT bridge

For factory pilots: edge gateway or line PC publishes machine metrics over MQTT; this bridge forwards them to Vectra's HTTP ingest API.

## Setup

1. In Vectra **Settings → Connect a line**, copy your **API key** and **MQTT topic**.
2. Install and run:

```bash
cd services/mqtt-bridge
npm install
export VECTRA_API_KEY=vk_...
export MQTT_TOPIC=vectra/plant/xxxxxxxxxxxx/telemetry   # shown in Settings
npm start
```

Optional:

- `VECTRA_INGEST_URL` — defaults to production ingest
- `MQTT_BROKER_URL` — defaults to `mqtt://test.mosquitto.org:1883` for demos; use your plant broker in production

## Publish test message

```bash
mosquitto_pub -h test.mosquitto.org -t "vectra/plant/YOUR_SLUG/telemetry" -m '{"deviceId":"SMT-01","metric":"reject_rate","value":4.2,"threshold":3.0,"unit":"percent"}'
```

`deviceId` must exist in your plant workspace (import CSV/Excel first).

## Production note

Run the bridge on the line gateway with a private Mosquitto/HiveMQ broker. TLS + username/password on the broker; API key stays on the bridge host only.
