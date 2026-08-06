"use client";

import { useRef, useState, type RefObject } from "react";
import { Download, FileUp } from "lucide-react";
import { downloadCsv } from "@/lib/csv";
import {
  ALERTS_TEMPLATE,
  DEVICE_TEMPLATE,
  MAINTENANCE_TEMPLATE,
  buildImportPreview,
  type ImportPreview,
} from "@/lib/import-csv";
import { useStore } from "@/lib/store";

type FileKind = "devices" | "alerts" | "maintenance";

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsText(file);
  });
}

export function ImportPlantData() {
  const { importPlantData, usingSample, hasPlantData } = useStore();
  const [devicesCsv, setDevicesCsv] = useState<string | null>(null);
  const [alertsCsv, setAlertsCsv] = useState<string | null>(null);
  const [maintenanceCsv, setMaintenanceCsv] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [fileNames, setFileNames] = useState<Partial<Record<FileKind, string>>>({});

  const devicesRef = useRef<HTMLInputElement>(null);
  const alertsRef = useRef<HTMLInputElement>(null);
  const maintenanceRef = useRef<HTMLInputElement>(null);

  async function handleFile(kind: FileKind, file: File | undefined) {
    if (!file) return;
    const text = await readFile(file);
    setFileNames((prev) => ({ ...prev, [kind]: file.name }));

    const nextDevices = kind === "devices" ? text : devicesCsv;
    const nextAlerts = kind === "alerts" ? text : alertsCsv;
    const nextMaintenance = kind === "maintenance" ? text : maintenanceCsv;

    if (kind === "devices") setDevicesCsv(text);
    if (kind === "alerts") setAlertsCsv(text);
    if (kind === "maintenance") setMaintenanceCsv(text);

    if (nextDevices) {
      setPreview(buildImportPreview(nextDevices, nextAlerts ?? undefined, nextMaintenance ?? undefined));
    } else {
      setPreview(null);
    }
  }

  function resetImport() {
    setDevicesCsv(null);
    setAlertsCsv(null);
    setMaintenanceCsv(null);
    setPreview(null);
    setFileNames({});
    if (devicesRef.current) devicesRef.current.value = "";
    if (alertsRef.current) alertsRef.current.value = "";
    if (maintenanceRef.current) maintenanceRef.current.value = "";
  }

  function confirmImport() {
    if (!preview || preview.errors.length > 0 || preview.devices.length === 0) return;
    importPlantData({
      devices: preview.devices,
      alerts: preview.alerts,
      maintenance: preview.maintenance,
      records: [],
    });
    resetImport();
  }

  return (
    <div className="card p-6">
      <h3 className="text-[15px] font-medium">Import your plant</h3>
      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
        Upload CSV files to populate machines, alerts, and maintenance. Start with devices — alerts
        and maintenance reference device IDs from that file. Data saves to this browser.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => downloadCsv("vectra-devices-template.csv", DEVICE_TEMPLATE)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] px-3 py-1.5 text-[12px] hover:bg-[var(--bg-hover)]"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
          Devices template
        </button>
        <button
          type="button"
          onClick={() => downloadCsv("vectra-alerts-template.csv", ALERTS_TEMPLATE)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] px-3 py-1.5 text-[12px] hover:bg-[var(--bg-hover)]"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
          Alerts template
        </button>
        <button
          type="button"
          onClick={() => downloadCsv("vectra-maintenance-template.csv", MAINTENANCE_TEMPLATE)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] px-3 py-1.5 text-[12px] hover:bg-[var(--bg-hover)]"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
          Maintenance template
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <UploadRow
          label="Devices CSV"
          required
          fileName={fileNames.devices}
          inputRef={devicesRef}
          onChange={(file) => handleFile("devices", file)}
        />
        <UploadRow
          label="Alerts CSV (optional)"
          fileName={fileNames.alerts}
          inputRef={alertsRef}
          onChange={(file) => handleFile("alerts", file)}
        />
        <UploadRow
          label="Maintenance CSV (optional)"
          fileName={fileNames.maintenance}
          inputRef={maintenanceRef}
          onChange={(file) => handleFile("maintenance", file)}
        />
      </div>

      {preview && (
        <div className="mt-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
          <div className="text-[13px] font-medium">Preview</div>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
            {preview.devices.length} devices · {preview.alerts.length} alerts ·{" "}
            {preview.maintenance.length} maintenance
          </p>

          {preview.errors.length > 0 && (
            <ul className="mt-3 space-y-1 text-[12px] text-red-400">
              {preview.errors.slice(0, 6).map((err) => (
                <li key={err}>{err}</li>
              ))}
              {preview.errors.length > 6 && (
                <li>…and {preview.errors.length - 6} more errors</li>
              )}
            </ul>
          )}

          {preview.devices.length > 0 && preview.errors.length === 0 && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="text-[var(--text-muted)]">
                    <th className="pb-2 pr-4 font-normal">Machine</th>
                    <th className="pb-2 pr-4 font-normal">Line</th>
                    <th className="pb-2 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.devices.slice(0, 5).map((d) => (
                    <tr key={d.id} className="border-t border-[var(--border-subtle)]">
                      <td className="py-2 pr-4">{d.name}</td>
                      <td className="py-2 pr-4 text-[var(--text-secondary)]">{d.line}</td>
                      <td className="py-2 capitalize text-[var(--text-secondary)]">{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.devices.length > 5 && (
                <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                  +{preview.devices.length - 5} more devices
                </p>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!preview || preview.errors.length > 0 || preview.devices.length === 0}
              onClick={confirmImport}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Import plant data
            </button>
            <button
              type="button"
              onClick={resetImport}
              className="rounded-lg border border-[var(--border-strong)] px-4 py-2 text-[13px] hover:bg-[var(--bg-hover)]"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {usingSample && (
        <p className="mt-4 text-[12px] text-amber-400">
          Example dataset is active — importing will replace it with your CSV data.
        </p>
      )}
      {hasPlantData && !usingSample && (
        <p className="mt-4 text-[12px] text-[var(--text-muted)]">
          Importing again replaces your current plant list. Signed records are reset unless you
          export them first from Reports.
        </p>
      )}
    </div>
  );
}

function UploadRow({
  label,
  required,
  fileName,
  inputRef,
  onChange,
}: {
  label: string;
  required?: boolean;
  fileName?: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (file: File | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-[var(--border-strong)] px-4 py-3">
      <div>
        <div className="text-[13px] font-medium">
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </div>
        {fileName ? (
          <div className="mt-0.5 text-[12px] text-[var(--text-secondary)]">{fileName}</div>
        ) : (
          <div className="mt-0.5 text-[12px] text-[var(--text-muted)]">No file selected</div>
        )}
      </div>
      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border-strong)] px-3 py-1.5 text-[12px] hover:bg-[var(--bg-hover)]">
        <FileUp className="h-3.5 w-3.5" strokeWidth={1.5} />
        Choose file
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0])}
        />
      </label>
    </div>
  );
}
