"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Radio, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isCloudUserId } from "@/lib/plant-db";
import {
  fetchTelemetryKeyInfo,
  rotateTelemetryApiKey,
  sendTestTelemetry,
} from "@/lib/plant-cloud";
import { useStore } from "@/lib/store";
import { getAppUrl } from "@/lib/auth";

export function ConnectLinePanel() {
  const { user, plantRole, readOnly } = useAuth();
  const { devices, usingSample, refreshFromCloud } = useStore();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [mqttTopic, setMqttTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const cloudUser = user && isCloudUserId(user.id);
  const canRotate = plantRole === "owner" || plantRole === "ops_lead" || !plantRole;
  const appUrl = getAppUrl().replace(/\/$/, "");
  const firstDevice = devices[0]?.id ?? "SMT-01";

  const loadKey = useCallback(async () => {
    if (!cloudUser) return;
    setLoading(true);
    const info = await fetchTelemetryKeyInfo();
    setApiKey(info?.apiKey ?? null);
    setMqttTopic(info?.mqttTopic ?? null);
    setLoading(false);
  }, [cloudUser]);

  useEffect(() => {
    void loadKey();
  }, [loadKey]);

  async function rotateKey() {
    const info = await rotateTelemetryApiKey();
    if (info) {
      setApiKey(info.apiKey);
      setMqttTopic(info.mqttTopic);
    }
  }

  function copyText(label: string, text: string) {
    void navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 2000);
  }

  const curlExample = apiKey
    ? `curl -X POST ${appUrl}/api/telemetry/ingest \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"deviceId":"${firstDevice}","metric":"reject_rate","value":4.2,"threshold":3.0,"unit":"percent","source":"http"}'`
    : "";

  const mqttPublishExample = mqttTopic
    ? `mosquitto_pub -h test.mosquitto.org -t "${mqttTopic}" \\
  -m '{"deviceId":"${firstDevice}","metric":"reject_rate","value":4.2,"threshold":3.0,"unit":"percent"}'`
    : "";

  async function runTestSignal() {
    if (!apiKey || usingSample || readOnly) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await sendTestTelemetry({
        apiKey,
        deviceId: firstDevice,
        metric: "reject_rate",
        value: 4.2,
        threshold: 3.0,
      });
      await refreshFromCloud();
      setTestResult(
        result.alertCreated
          ? `Alert created for ${firstDevice}. Check Alerts.`
          : `Signal received for ${firstDevice}.`
      );
    } catch {
      setTestResult("Test failed — confirm devices exist and schema is applied.");
    } finally {
      setTesting(false);
    }
  }

  if (!cloudUser) {
    return (
      <div className="card p-6">
        <h3 className="text-[15px] font-medium">Connect a line</h3>
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
          Telemetry ingest and cloud sync require Google or email sign-in. Wallet sessions keep
          data in this browser only.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-medium">Connect a line</h3>
          <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
            HTTP ingest for SCADA scripts and MQTT bridge for edge gateways. One API key per plant
            team — metrics flow into shared alerts.
          </p>
        </div>
        <Radio className="h-5 w-5 shrink-0 text-[var(--accent)]" strokeWidth={1.5} />
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="text-[12px] text-[var(--text-muted)]">Telemetry API key</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <code className="max-w-full truncate rounded-lg bg-[var(--bg-elevated)] px-3 py-2 text-[11px]">
              {loading ? "Loading…" : apiKey ?? "Run supabase/schema-v2-tenants.sql first"}
            </code>
            {apiKey && (
              <button
                type="button"
                onClick={() => copyText("key", apiKey)}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-strong)] px-2.5 py-1.5 text-[11px] hover:bg-[var(--bg-hover)]"
              >
                <Copy className="h-3 w-3" />
                {copied === "key" ? "Copied" : "Copy"}
              </button>
            )}
            {canRotate && (
              <button
                type="button"
                onClick={() => void rotateKey()}
                className="rounded-lg border border-[var(--border-strong)] px-2.5 py-1.5 text-[11px] hover:bg-[var(--bg-hover)]"
              >
                Rotate key
              </button>
            )}
          </div>
        </div>

        {mqttTopic && (
          <div>
            <div className="flex items-center justify-between">
              <div className="text-[12px] text-[var(--text-muted)]">MQTT topic (plant-scoped)</div>
              <button
                type="button"
                onClick={() => copyText("mqtt", mqttTopic)}
                className="text-[11px] text-[var(--accent)] hover:underline"
              >
                {copied === "mqtt" ? "Copied" : "Copy topic"}
              </button>
            </div>
            <code className="mt-1 block overflow-x-auto rounded-lg bg-[var(--bg-elevated)] px-3 py-2 text-[11px]">
              {mqttTopic}
            </code>
            <p className="mt-2 text-[12px] text-[var(--text-muted)]">
              Run the bridge:{" "}
              <code className="text-[11px]">services/mqtt-bridge</code> (see README). Publish JSON
              with deviceId, metric, value, threshold.
            </p>
          </div>
        )}

        {curlExample && (
          <div>
            <div className="flex items-center justify-between">
              <div className="text-[12px] text-[var(--text-muted)]">HTTP ingest (curl)</div>
              <button
                type="button"
                onClick={() => copyText("curl", curlExample)}
                className="text-[11px] text-[var(--accent)] hover:underline"
              >
                {copied === "curl" ? "Copied" : "Copy curl"}
              </button>
            </div>
            <pre className="mt-1 overflow-x-auto rounded-lg bg-[var(--bg-elevated)] p-3 text-[10px] leading-relaxed text-[var(--text-secondary)]">
              {curlExample}
            </pre>
          </div>
        )}

        {mqttPublishExample && (
          <div>
            <div className="flex items-center justify-between">
              <div className="text-[12px] text-[var(--text-muted)]">MQTT publish (demo broker)</div>
              <button
                type="button"
                onClick={() => copyText("mqttpub", mqttPublishExample)}
                className="text-[11px] text-[var(--accent)] hover:underline"
              >
                {copied === "mqttpub" ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="mt-1 overflow-x-auto rounded-lg bg-[var(--bg-elevated)] p-3 text-[10px] leading-relaxed text-[var(--text-secondary)]">
              {mqttPublishExample}
            </pre>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            disabled={!apiKey || usingSample || testing || devices.length === 0 || readOnly}
            onClick={() => void runTestSignal()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${testing ? "animate-spin" : ""}`} />
            Send test signal
          </button>
          <button
            type="button"
            onClick={() => void refreshFromCloud()}
            className="rounded-lg border border-[var(--border-strong)] px-4 py-2 text-[13px] hover:bg-[var(--bg-hover)]"
          >
            Refresh from cloud
          </button>
        </div>

        {readOnly && (
          <p className="text-[12px] text-amber-400">
            Vendor role: view telemetry settings only. Ops lead or owner sends test signals.
          </p>
        )}
        {usingSample && (
          <p className="text-[12px] text-amber-400">
            Clear example data and import devices (or use your plant list) before sending live
            telemetry.
          </p>
        )}
        {testResult && (
          <p className="text-[12px] text-[var(--text-secondary)]">{testResult}</p>
        )}
      </div>
    </div>
  );
}
