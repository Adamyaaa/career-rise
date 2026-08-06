const UNIT_TO_SECONDS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 60 * 60 * 24,
};

// Parses zeit/ms-style durations ("15m", "7d", "3600") used throughout .env
// (JWT_ACCESS_TTL, JWT_REFRESH_TTL) into seconds, for Redis TTLs.
export function parseDurationToSeconds(value: string): number {
  const match = /^(\d+)(s|m|h|d)?$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid duration string: "${value}"`);
  }
  const amount = Number(match[1]);
  const unit = match[2] ?? "s";
  return amount * UNIT_TO_SECONDS[unit];
}
