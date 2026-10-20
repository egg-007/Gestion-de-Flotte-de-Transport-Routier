export function isValidMileage(start: number, end: number): boolean {
  return (
    Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end > start
  );
}
export function hasDateOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  return startA < endB && startB < endA;
}
export function isMaintenanceDue(
  currentKm: number,
  nextMaintenanceKm: number,
): boolean {
  return currentKm >= nextMaintenanceKm;
}
