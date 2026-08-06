import * as XLSX from "xlsx";
import {
  ALERTS_TEMPLATE,
  DEVICE_TEMPLATE,
  MAINTENANCE_TEMPLATE,
  buildImportPreview,
  type ImportPreview,
} from "./import-csv";

export type WorkbookSections = {
  devicesCsv: string;
  alertsCsv: string;
  maintenanceCsv: string;
  errors: string[];
};

export const COMBINED_TEMPLATE = `# devices
${DEVICE_TEMPLATE}

# alerts
${ALERTS_TEMPLATE}

# maintenance
${MAINTENANCE_TEMPLATE}`;

const SECTION_ALIASES: Record<keyof Omit<WorkbookSections, "errors">, string[]> = {
  devicesCsv: ["devices", "device", "machines", "machine"],
  alertsCsv: ["alerts", "alert"],
  maintenanceCsv: ["maintenance", "maint", "work_orders", "workorders"],
};

function csvToSheet(csv: string): XLSX.WorkSheet {
  const book = XLSX.read(csv, { type: "string" });
  return book.Sheets[book.SheetNames[0]];
}

export function downloadWorkbookTemplate() {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, csvToSheet(DEVICE_TEMPLATE), "devices");
  XLSX.utils.book_append_sheet(wb, csvToSheet(ALERTS_TEMPLATE), "alerts");
  XLSX.utils.book_append_sheet(wb, csvToSheet(MAINTENANCE_TEMPLATE), "maintenance");
  XLSX.writeFile(wb, "vectra-plant-template.xlsx");
}

function findSheet(
  wb: XLSX.WorkBook,
  aliases: string[]
): XLSX.WorkSheet | null {
  for (const name of wb.SheetNames) {
    if (aliases.includes(name.trim().toLowerCase())) {
      return wb.Sheets[name];
    }
  }
  return null;
}

export function splitCombinedCsv(text: string): WorkbookSections {
  const errors: string[] = [];
  const hasSections = /^\s*#\s*(devices?|alerts?|maintenance)\s*$/im.test(text);

  if (!hasSections) {
    return {
      devicesCsv: text.trim(),
      alertsCsv: "",
      maintenanceCsv: "",
      errors,
    };
  }

  const sections: Record<"devices" | "alerts" | "maintenance", string[]> = {
    devices: [],
    alerts: [],
    maintenance: [],
  };
  let current: keyof typeof sections | null = null;

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (/^\s*#\s*devices?\s*$/i.test(trimmed)) {
      current = "devices";
      continue;
    }
    if (/^\s*#\s*alerts?\s*$/i.test(trimmed)) {
      current = "alerts";
      continue;
    }
    if (/^\s*#\s*maintenance\s*$/i.test(trimmed)) {
      current = "maintenance";
      continue;
    }
    if (!current) continue;
    sections[current].push(line);
  }

  const devicesCsv = sections.devices.join("\n").trim();
  if (!devicesCsv) {
    errors.push('Combined CSV must include a "# devices" section with at least one machine row.');
  }

  return {
    devicesCsv,
    alertsCsv: sections.alerts.join("\n").trim(),
    maintenanceCsv: sections.maintenance.join("\n").trim(),
    errors,
  };
}

export function parseXlsxBuffer(buffer: ArrayBuffer): WorkbookSections {
  const errors: string[] = [];
  const wb = XLSX.read(buffer, { type: "array" });

  const devicesSheet = findSheet(wb, SECTION_ALIASES.devicesCsv);
  if (!devicesSheet) {
    return {
      devicesCsv: "",
      alertsCsv: "",
      maintenanceCsv: "",
      errors: ['Workbook must include a sheet named "devices".'],
    };
  }

  const alertsSheet = findSheet(wb, SECTION_ALIASES.alertsCsv);
  const maintenanceSheet = findSheet(wb, SECTION_ALIASES.maintenanceCsv);

  return {
    devicesCsv: XLSX.utils.sheet_to_csv(devicesSheet),
    alertsCsv: alertsSheet ? XLSX.utils.sheet_to_csv(alertsSheet) : "",
    maintenanceCsv: maintenanceSheet ? XLSX.utils.sheet_to_csv(maintenanceSheet) : "",
    errors,
  };
}

export function buildPreviewFromSections(sections: WorkbookSections): ImportPreview {
  const preview = buildImportPreview(
    sections.devicesCsv,
    sections.alertsCsv || undefined,
    sections.maintenanceCsv || undefined
  );
  return {
    ...preview,
    errors: [...sections.errors, ...preview.errors],
  };
}

export function isWorkbookFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".xlsx") ||
    name.endsWith(".xls") ||
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel"
  );
}
