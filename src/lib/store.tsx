"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  clearPlantCloud,
  fetchPlantFromCloud,
  savePlantToCloud,
} from "@/lib/plant-cloud";
import { isCloudUserId } from "@/lib/plant-db";
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
  cloudSynced: boolean;
  devices: Device[];
  alerts: Alert[];
  maintenance: MaintenanceEvent[];
  records: SignedRecord[];
  toast: string | null;
  loadSamplePlant: () => void;
  clearPlantData: () => void;
  importPlantData: (data: PlantData) => void;
  refreshFromCloud: () => Promise<void>;
  acknowledgeAlert: (id: string) => void;
  assignAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  closeMaintenance: (id: string, sealedByName?: string) => Promise<void>;
  clearToast: () => void;
}

const StoreContext = createContext<Store | null>(null);

function applyPlant(setters: {
  setDevices: (d: Device[]) => void;
  setAlerts: (a: Alert[]) => void;
  setMaintenance: (m: MaintenanceEvent[]) => void;
  setRecords: (r: SignedRecord[]) => void;
  plant: PlantData;
}) {
  setters.setDevices(setters.plant.devices);
  setters.setAlerts(setters.plant.alerts);
  setters.setMaintenance(setters.plant.maintenance);
  setters.setRecords(setters.plant.records);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, refreshWorkspace } = useAuth();
  const [ready, setReady] = useState(false);
  const [usingSample, setUsingSample] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceEvent[]>([]);
  const [records, setRecords] = useState<SignedRecord[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const skipPersist = useRef(false);

  useEffect(() => {
    if (!user) {
      setReady(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setReady(false);
      const ws = loadWorkspace(user!.id);

      if (ws.sampleData) {
        applyPlant({
          setDevices,
          setAlerts,
          setMaintenance,
          setRecords,
          plant: {
            devices: initialDevices,
            alerts: initialAlerts,
            maintenance: initialMaintenance,
            records: initialRecords,
          },
        });
        setUsingSample(true);
        setCloudSynced(false);
        if (!cancelled) setReady(true);
        return;
      }

      setUsingSample(false);
      let plant: PlantData | null = null;
      let synced = false;

      if (isCloudUserId(user!.id)) {
        plant = await fetchPlantFromCloud();
        if (plant && hasPlantData(plant)) {
          synced = true;
        } else {
          const local = loadPlantData(user!.id);
          if (hasPlantData(local)) {
            plant = local;
            await savePlantToCloud(local);
            synced = true;
          } else {
            plant = local;
          }
        }
      } else {
        plant = loadPlantData(user!.id);
      }

      if (!cancelled) {
        applyPlant({
          setDevices,
          setAlerts,
          setMaintenance,
          setRecords,
          plant: plant ?? { devices: [], alerts: [], maintenance: [], records: [] },
        });
        setCloudSynced(synced);
        setReady(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user || !ready || usingSample || skipPersist.current) return;

    const plant: PlantData = { devices, alerts, maintenance, records };
    savePlantData(user.id, plant);

    if (!isCloudUserId(user.id)) return;

    const timer = window.setTimeout(async () => {
      const ok = await savePlantToCloud(plant);
      setCloudSynced(ok);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [user, ready, usingSample, devices, alerts, maintenance, records]);

  const refreshFromCloud = useCallback(async () => {
    if (!user || !isCloudUserId(user.id) || usingSample) return;
    const plant = await fetchPlantFromCloud();
    if (plant) {
      skipPersist.current = true;
      applyPlant({ setDevices, setAlerts, setMaintenance, setRecords, plant });
      savePlantData(user.id, plant);
      window.setTimeout(() => {
        skipPersist.current = false;
      }, 100);
      setCloudSynced(true);
    }
  }, [user, usingSample]);

  const loadSamplePlant = useCallback(() => {
    if (!user) return;
    clearStoredPlant(user.id);
    void clearPlantCloud();
    saveWorkspace(user.id, { sampleData: true });
    applyPlant({
      setDevices,
      setAlerts,
      setMaintenance,
      setRecords,
      plant: {
        devices: initialDevices,
        alerts: initialAlerts,
        maintenance: initialMaintenance,
        records: initialRecords,
      },
    });
    setUsingSample(true);
    setCloudSynced(false);
    refreshWorkspace();
    setToast("Example plant data loaded");
  }, [user, refreshWorkspace]);

  const clearPlantData = useCallback(async () => {
    if (!user) return;
    clearStoredPlant(user.id);
    await clearPlantCloud();
    saveWorkspace(user.id, { sampleData: false });
    applyPlant({
      setDevices,
      setAlerts,
      setMaintenance,
      setRecords,
      plant: { devices: [], alerts: [], maintenance: [], records: [] },
    });
    setUsingSample(false);
    setCloudSynced(false);
    refreshWorkspace();
    setToast("Plant data cleared");
  }, [user, refreshWorkspace]);

  const importPlantData = useCallback(
    async (data: PlantData) => {
      if (!user) return;
      clearStoredPlant(user.id);
      saveWorkspace(user.id, { sampleData: false });
      applyPlant({ setDevices, setAlerts, setMaintenance, setRecords, plant: data });
      setUsingSample(false);
      savePlantData(user.id, data);
      if (isCloudUserId(user.id)) {
        const ok = await savePlantToCloud(data);
        setCloudSynced(ok);
      }
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
    setAlerts((prev) => {
      const next = prev.map((a) =>
        a.id === id ? { ...a, status: "resolved" as const } : a
      );
      setDevices((devs) =>
        devs.map((d) => {
          const open = next.filter(
            (a) => a.deviceId === d.id && a.status !== "resolved"
          ).length;
          return {
            ...d,
            alertCount: open,
            status: open === 0 && d.status !== "offline" ? "online" : d.status,
          };
        })
      );
      return next;
    });
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
      cloudSynced,
      devices,
      alerts,
      maintenance,
      records,
      toast,
      loadSamplePlant,
      clearPlantData,
      importPlantData,
      refreshFromCloud,
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
      cloudSynced,
      devices,
      alerts,
      maintenance,
      records,
      toast,
      loadSamplePlant,
      clearPlantData,
      importPlantData,
      refreshFromCloud,
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
