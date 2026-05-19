"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { categoryLabel } from "@/lib/categories";
import { useAuth } from "@/lib/auth-context";
import { formatRelativeTime } from "@/lib/posts";
import { fetchUserProfile, toggleFollow, type ProfileData, type ProfilePostItem } from "@/lib/profile";
import styles from "./page.module.css";

function PostGroup({ title, emptyText, posts }: { title: string; emptyText: string; posts: ProfilePostItem[] }) {
  return (
    <>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {posts.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <ul className={styles.postList}>
          {posts.map((p) => (
            <li key={`${title}-${p.id}`}>
              <Link href={`/post/${p.id}`} className={styles.postItem}>
                <div className={styles.postHead}>
                  <span className={styles.postBadge}>{categoryLabel(p.category)}</span>
                  <time dateTime={p.created_at}>{formatRelativeTime(p.created_at)}</time>
                </div>
                <h3 className={styles.postTitle}>{p.title}</h3>
                <div className={styles.postStats}>
                  <span>{p.view_count} 浏览</span>
                  <span>{p.like_count} 赞</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function UserProfilePage() {
  const params = useParams();
  const username = String(params.username);
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followPending, setFollowPending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setProfile(await fetchUserProfile(username));
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  const handleFollow = async () => {
    if (!profile || followPending) return;
    setFollowPending(true);
    try {
      const result = await toggleFollow(profile.username);
      setProfile((prev) => prev ? ({
        ...prev,
        is_following: result.following,
        followers_count: result.followers_count,
      }) : prev);
    } catch (e) {
      alert(e instanceof Error ? e.message : "操作失败");
    } finally {
      setFollowPending(false);
    }
  };

  if (loading) return <main className={styles.main}><p className={styles.empty}>加载中…</p></main>;
  if (error || !profile) return <main className={styles.main}><p className={styles.empty}>{error ?? "用户不存在"}</p></main>;

  return (
    <main className={styles.main}>
      <Link className={styles.backLink} href="/">← 返回首页</Link>

      <div className={styles.card}>
        <div className={styles.avatar}>
          {profile.nickname.charAt(0).toUpperCase()}
        </div>
        <h1 className={styles.nickname}>{profile.nickname}</h1>
        <p className={styles.username}>@{profile.username}</p>
        <div className={styles.meta}>
          <span>{profile.post_count} 篇帖子</span>
          <span>·</span>
          <span>{profile.followers_count} 粉丝</span>
          <span>·</span>
          <span>{profile.following_count} 关注</span>
          <span>·</span>
          <span>{formatRelativeTime(profile.created_at)} 加入</span>
        </div>
        <div className={styles.actions}>
          {!profile.is_self && user ? (
            <button className={styles.followBtn} onClick={handleFollow} disabled={followPending}>
              {followPending ? "处理中…" : profile.is_following ? "取消关注" : "关注"}
            </button>
          ) : null}
          {!profile.is_self && !user ? (
            <Link href="/login" className={styles.loginHint}>
              登录后可关注
            </Link>
          ) : null}
        </div>
      </div>

      <PostGroup title="最近帖子" emptyText="暂无帖子" posts={profile.posts} />

      {profile.is_self ? (
        <PostGroup title="点赞历史" emptyText="还没有点赞记录" posts={profile.liked_posts} />
      ) : null}

      {profile.is_self ? (
        <>
          <h2 className={styles.sectionTitle}>关注中</h2>
          {profile.following_users.length === 0 ? (
            <p className={styles.empty}>你还没有关注任何人</p>
          ) : (
            <ul className={styles.followList}>
              {profile.following_users.map((item) => (
                <li key={item.id}>
                  <Link href={`/user/${item.username}`} className={styles.followCard}>
                    <span className={styles.followName}>{item.nickname}</span>
                    <span className={styles.followUsername}>@{item.username}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </main>
  );
}
