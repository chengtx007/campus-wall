export type Post = {
  id: number;
  title: string;
  body: string;
  category: string;
  created_at: string;
};

export type PostListResponse = {
  items: Post[];
  total: number;
};

export function getBackendBaseUrl(): string {
  return process.env.BACKEND_URL ?? "http://127.0.0.1:8000";
}

export async function fetchPostList(skip = 0, limit = 20): Promise<PostListResponse> {
  const url = `${getBackendBaseUrl()}/api/posts?skip=${skip}&limit=${limit}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`加载帖子失败：HTTP ${res.status}`);
  }
  return (await res.json()) as PostListResponse;
}

export async function fetchPostById(id: number): Promise<Post> {
  const res = await fetch(`${getBackendBaseUrl()}/api/posts/${id}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(res.status === 404 ? "帖子不存在" : `加载帖子失败：HTTP ${res.status}`);
  }
  return (await res.json()) as Post;
}

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const WEEK = 604800;
const MONTH = 2592000;
const YEAR = 31536000;

export function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const delta = Math.floor((now - then) / 1000);

  if (delta < 0) return "刚刚";
  if (delta < MINUTE) return "刚刚";
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)} 分钟前`;
  if (delta < DAY) return `${Math.floor(delta / HOUR)} 小时前`;
  if (delta < 2 * DAY) return "昨天";
  if (delta < WEEK) return `${Math.floor(delta / DAY)} 天前`;
  if (delta < MONTH) return `${Math.floor(delta / WEEK)} 周前`;
  if (delta < YEAR) return `${Math.floor(delta / MONTH)} 个月前`;
  return `${Math.floor(delta / YEAR)} 年前`;
}
