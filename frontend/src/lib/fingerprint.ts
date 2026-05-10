const STORAGE_KEY = "cw_fingerprint";

export function getFingerprint(): string {
  if (typeof window === "undefined") return "";
  let fp = localStorage.getItem(STORAGE_KEY);
  if (!fp) {
    fp = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, fp);
  }
  return fp;
}
