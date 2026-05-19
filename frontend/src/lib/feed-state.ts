import type { Post } from "./posts";

const FEED_STATE_PREFIX = "cw_feed_state_v1:";

type FeedState = {
  items: Post[];
  total: number;
  scrollY: number;
  savedAt: number;
};

export function getFeedStateKey(tab: string, query: string): string {
  return `${FEED_STATE_PREFIX}${tab}:${query.trim().toLowerCase()}`;
}

export function readFeedState(key: string): FeedState | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<FeedState>;
    if (!Array.isArray(parsed.items) || typeof parsed.total !== "number") {
      return null;
    }
    return {
      items: parsed.items,
      total: parsed.total,
      scrollY: typeof parsed.scrollY === "number" ? parsed.scrollY : 0,
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveFeedState(key: string, state: Omit<FeedState, "savedAt">): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    key,
    JSON.stringify({
      ...state,
      savedAt: Date.now(),
    })
  );
}

export function saveFeedScroll(key: string, scrollY: number): void {
  const existing = readFeedState(key);
  if (!existing) return;
  saveFeedState(key, {
    items: existing.items,
    total: existing.total,
    scrollY,
  });
}
