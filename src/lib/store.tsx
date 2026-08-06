"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  initialAlerts,
  initialDevices,
  initialMaintenance,
  initialRecords,
} from "@/lib/seed";
import { nextRecordId, sealRecord } from "@/lib/record-seal";
import { useAuth } from "@/lib/auth-context";
import {
  clearPlantData as clearStoredPlant,
  hasPlantData,
  loadPlantData,
  savePlantData,
  type PlantData,
} from "@/lib/plant-data";
import { loadWorkspace, saveWorkspace } from "@/lib/workspace";
import type { Alert, Device, MaintenanceEvent, SignedRecord } from "@/lib/types";

interface Store {
  ready: boolean;
  usingSample: boolean;
  hasPlantData: boolean;
  devices: Device[];
  alerts: Alert[];
  maintenance: MaintenanceEvent[];
  records: SignedRecord[];
  toast: string | null;
  loadSamplePlant: () => void;
  clearPlantData: () => void;
  importPlantData: (data: PlantData) => void;
  acknowledgeAlert: (id: string) => void;
  assignAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  closeMaintenance: (id: string, sealedByName?: string) => Promise<void>;
  clearToast: () => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, refreshWorkspace } = useAuth();
  const [ready, setReady] = useState(false);
  const [usingSample, setUsingSample] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceEvent[]>([]);
  const [records, setRecords] = useState<SignedRecord[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setReady(false);
      return;
    }
    const ws = loadWorkspace(user.id);
    if (ws.sampleData) {
      setDevices(initialDevices);
      setAlerts(initialAlerts);
      setMaintenance(initialMaintenance);
      setRecords(initialRecords);
      setUsingSample(true);
    } else {
      const stored = loadPlantData(user.id);
      setDevices(stored.devices);
      setAlerts(stored.alerts);
      setMaintenance(stored.maintenance);
      setRecords(stored.records);
      setUsingSample(false);
    }
    setReady(true);
  }, [user?.id]);

  useEffect(() => {
    if (!user || !ready || usingSample) return;
    savePlantData(user.id, { devices, alerts, maintenance, records });
  }, [user, ready, usingSample, devices, alerts, maintenance, records]);

  const loadSamplePlant = useCallback(() => {
    if (!user) return;
    clearStoredPlant(user.id);
    saveWorkspace(user.id, { sampleData: true });
    setDevices(initialDevices);
    setAlerts(initialAlerts);
    setMaintenance(initialMaintenance);
    setRecords(initialRecords);
    setUsingSample(true);
    refreshWorkspace();
    setToast("Example plant data loaded");
  }, [user, refreshWorkspace]);

  const clearPlantData = useCallback(() => {
    if (!user) return;
    clearStoredPlant(user.id);
    saveWorkspace(user.id, { sampleData: false });
    setDevices([]);
    setAlerts([]);
    setMaintenance([]);
    setRecords([]);
    setUsingSample(false);
    refreshWorkspace();
    setToast("Plant data cleared");
  }, [user, refreshWorkspace]);

  const importPlantData = useCallback(
    (data: PlantData) => {
      if (!user) return;
      clearStoredPlant(user.id);
      saveWorkspace(user.id, { sampleData: false });
      setDevices(data.devices);
      setAlerts(data.alerts);
      setMaintenance(data.maintenance);
      setRecords(data.records);
      setUsingSample(false);
      savePlantData(user.id, data);
      refreshWorkspace();
      setToast(
        `Imported ${data.devices.length} devices${data.alerts.length ? `, ${data.alerts.length} alerts` : ""}${data.maintenance.length ? `, ${data.maintenance.length} maintenance` : ""}`
      );
    },
    [user, refreshWorkspace]
  );

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "acknowledged" as const } : a))
    );
    setToast("Alert acknowledged");
  }, []);

  const assignAlert = useCallback(
    (id: string) => {
      const assignee = user?.name?.trim() || "Unassigned";
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, assignedTo: assignee, status: "acknowledged" as const }
            : a
        )
      );
      setToast(`Assigned to ${assignee}`);
    },
    [user?.name]
  );

  const resolveAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "resolved" as const } : a))
    );
    setToast("Alert resolved");
  }, []);

  const closeMaintenance = useCallback(
    async (id: string, sealedByName?: string) => {
      const event = maintenance.find((m) => m.id === id);
      if (!event || event.status === "closed") return;

      const device = devices.find((d) => d.id === event.deviceId);
      const sealedBy = sealedByName?.trim() || user?.name?.trim() || "Plant user";
      const sealedAt = new Date().toISOString();
      const integrityHash = sealRecord({
        maintenanceId: id,
        device: device?.name ?? "Unknown",
        reason: event.reason,
        sealedBy,
        sealedAt,
      });

      setMaintenance((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, status: "closed" as const, closedAt: sealedAt, closedBy: sealedBy }
            : m
        )
      );

      const recordId = nextRecordId(records.length);
      let chainSignature: string | undefined;
      let chainExplorerUrl: string | undefined;
      let chainCluster: string | undefined;
      let chainError: string | undefined;

      setToast(`Sealing ${recordId}…`);

      try {
        const res = await fetch("/api/records/attest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sealHash: integrityHash,
            recordId,
            sealedBy,
            deviceName: device?.name ?? "Unknown",
            reason: event.reason,
          }),
        });
        const data = (await res.json()) as {
          signature?: string;
          explorerUrl?: string;
          cluster?: string;
          error?: string;
        };
        if (res.ok && data.signature) {
          chainSignature = data.signature;
          chainExplorerUrl = data.explorerUrl;
          chainCluster = data.cluster;
        } else {
          chainError = data.error || "Chain attest skipped";
        }
      } catch {
        chainError = "Chain attest unavailable";
      }

      const record: SignedRecord = {
        id: recordId,
        eventType: "Maintenance closed",
        deviceName: device?.name ?? "Unknown",
        sealedBy,
        sealedAt,
        integrityPassed: true,
        maintenanceId: id,
        integrityHash,
        chainSignature,
        chainExplorerUrl,
        chainCluster,
      };
      setRecords((prev) => [record, ...prev]);
      if (chainSignature) {
        setToast(`Signed + attested on Solana · ${record.id}`);
      } else {
        setToast(`Signed record · ${record.id}${chainError ? ` (${chainError})` : ""}`);
      }
    },
    [devices, maintenance, records.length, user?.name]
  );

  const clearToast = useCallback(() => setToast(null), []);

  const plantLoaded = hasPlantData({ devices, alerts, maintenance, records });

  const value = useMemo(
    () => ({
      ready,
      usingSample,
      hasPlantData: plantLoaded,
      devices,
      alerts,
      maintenance,
      records,
      toast,
      loadSamplePlant,
      clearPlantData,
      importPlantData,
      acknowledgeAlert,
      assignAlert,
      resolveAlert,
      closeMaintenance,
      clearToast,
    }),
    [
      ready,
      usingSample,
      plantLoaded,
      devices,
      alerts,
      maintenance,
      records,
      toast,
      loadSamplePlant,
      clearPlantData,
      importPlantData,
      acknowledgeAlert,
      assignAlert,
      resolveAlert,
      closeMaintenance,
      clearToast,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
