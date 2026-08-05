"use client";

import {
  createContext,
  useCallback,
  useContext,
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
import type { Alert, Device, MaintenanceEvent, SignedRecord } from "@/lib/types";

interface Store {
  devices: Device[];
  alerts: Alert[];
  maintenance: MaintenanceEvent[];
  records: SignedRecord[];
  toast: string | null;
  acknowledgeAlert: (id: string) => void;
  assignAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  closeMaintenance: (id: string) => void;
  clearToast: () => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [devices] = useState(initialDevices);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [records, setRecords] = useState(initialRecords);
  const [toast, setToast] = useState<string | null>(null);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "acknowledged" as const } : a))
    );
    setToast("Alert acknowledged");
  }, []);

  const assignAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, assignedTo: "Raj Kumar", status: "acknowledged" as const }
          : a
      )
    );
    setToast("Assigned to Raj Kumar");
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "resolved" as const } : a))
    );
    setToast("Alert resolved");
  }, []);

  const closeMaintenance = useCallback((id: string) => {
    const event = maintenance.find((m) => m.id === id);
    if (!event || event.status === "closed") return;

    const device = devices.find((d) => d.id === event.deviceId);
    const sealedBy = "Raj Kumar";
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
  }, [devices, maintenance, records.length]);

  const clearToast = useCallback(() => setToast(null), []);

  const value = useMemo(
    () => ({
      devices,
      alerts,
      maintenance,
      records,
      toast,
      acknowledgeAlert,
      assignAlert,
      resolveAlert,
      closeMaintenance,
      clearToast,
    }),
    [
      devices,
      alerts,
      maintenance,
      records,
      toast,
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
