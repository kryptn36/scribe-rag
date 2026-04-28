export function formatDuration(seconds: number | null | undefined): string | null {
  if (seconds == null) return null;
  if (seconds < 60) return `${seconds}s`;

  const mins = Math.round(seconds / 60);
  if (mins < 60) return `~${mins} min`;

  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `~${hrs}h ${remainMins}m` : `~${hrs}h`;
}
