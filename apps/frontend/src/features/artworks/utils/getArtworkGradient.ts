// FNV-1a + MurmurHash3 final mix: ids differing only in the last char still get far-apart hues.
function hashString(value: string): number {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;

  return hash >>> 0;
}

export function getArtworkGradient(id: string): string {
  const hue = hashString(id) % 360;
  const secondHue = (hue + 50) % 360;

  return `linear-gradient(135deg, hsl(${hue} 70% 60%), hsl(${secondHue} 65% 40%))`;
}
