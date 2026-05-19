import { authHeaders } from "./auth";
import { getBackendBaseUrl } from "./posts";

export type ProfilePostItem = {
  id: number;
  title: string;
  category: string;
  created_at: string;
  view_count: number;
  like_count: number;
};

export type FollowingUser = {
  id: number;
  username: string;
  nickname: string;
};

export type ProfileData = {
  id: number;
  username: string;
  nickname: string;
  created_at: string;
  post_count: number;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  is_self: boolean;
  posts: ProfilePostItem[];
  liked_posts: ProfilePostItem[];
  following_users: FollowingUser[];
};

export async function fetchUserProfile(username: string): Promise<ProfileData> {
  const url = `${getBackendBaseUrl()}/api/auth/users/${encodeURIComponent(username)}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(res.status === 404 ? "用户不存在" : "加载失败");
  }
  return res.json();
}

export async function toggleFollow(username: string): Promise<{
  following: boolean;
  followers_count: number;
}> {
  const res = await fetch(`${getBackendBaseUrl()}/api/auth/users/${encodeURIComponent(username)}/follow`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "操作失败");
  }
  return res.json();
}
