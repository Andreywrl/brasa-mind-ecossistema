import { customAlphabet } from "nanoid";

const nano = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 10);

/** Código curto para QR / digitação na portaria. */
export function newCheckinCode() {
  return nano();
}

export function mapsEmbedUrl(address: string) {
  const q = encodeURIComponent(address);
  return `https://maps.google.com/maps?q=${q}&hl=pt-BR&z=16&output=embed`;
}
