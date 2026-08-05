export function sealRecord(payload: Record<string, unknown>): string {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  let hash = 0;
  for (let i = 0; i < canonical.length; i++) {
    hash = (hash << 5) - hash + canonical.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, "0") +
    canonical.length.toString(16).toUpperCase().padStart(4, "0");
}

export function nextRecordId(count: number): string {
  return `REC-${10481 + count}`;
}
