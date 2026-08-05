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
import { loadWorkspace, saveWorkspace } from "@/lib/workspace";
import type { Alert, Device, MaintenanceEvent, SignedRecord } from "@/lib/types";

interface Store {
  ready: boolean;
  usingSample: boolean;
  devices: Device[];
  alerts: Alert[];
  maintenance: MaintenanceEvent[];
  records: SignedRecord[];
  toast: string | null;
  loadSamplePlant: () => void;
  clearPlantData: () => void;
  acknowledgeAlert: (id: string) => void;
  assignAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  closeMaintenance: (id: string, sealedByName?: string) => void;
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
      setDevices([]);
      setAlerts([]);
      setMaintenance([]);
      setRecords([]);
      setUsingSample(false);
    }
    setReady(true);
  }, [user?.id]);

  const loadSamplePlant = useCallback(() => {
    if (!user) return;
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
    saveWorkspace(user.id, { sampleData: false });
    setDevices([]);
    setAlerts([]);
    setMaintenance([]);
    setRecords([]);
    setUsingSample(false);
    refreshWorkspace();
    setToast("Example plant data cleared");
  }, [user, refreshWorkspace]);

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
    (id: string, sealedByName?: string) => {
      const event = maintenance.find((m) => m.id === id);
      if (!event || event.status === "closed") return;

      const device = devices.find((d) => d.id === event.deviceId);
      const sealedBy = sealedByName?.trim() || user?.name?.trim() || "Plant user";
      const sealedAt = new Date().toISOString();
      const hash = sealRecord({
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

      const record: SignedRecord = {
        id: nextRecordId(records.length),
        eventType: "Maintenance closed",
        deviceName: device?.name ?? "Unknown",
        sealedBy,
        sealedAt,
        integrityPassed: true,
        maintenanceId: id,
      };
      void hash;
      setRecords((prev) => [record, ...prev]);
      setToast(`Signed record created · ${record.id}`);
    },
    [devices, maintenance, records.length, user?.name]
  );

  const clearToast = useCallback(() => setToast(null), []);

  const value = useMemo(
    () => ({
      ready,
      usingSample,
      devices,
      alerts,
      maintenance,
      records,
      toast,
      loadSamplePlant,
      clearPlantData,
      acknowledgeAlert,
      assignAlert,
      resolveAlert,
      closeMaintenance,
      clearToast,
    }),
    [
      ready,
      usingSample,
      devices,
      alerts,
      maintenance,
      records,
      toast,
      loadSamplePlant,
      clearPlantData,
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
