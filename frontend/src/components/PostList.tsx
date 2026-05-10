"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Post } from "@/lib/posts";
import { fetchPostList, formatRelativeTime } from "@/lib/posts";
import { categoryLabel, filterPostsByTab, type NavTabSlug } from "@/lib/categories";
import { useSearch } from "@/lib/search-context";
import { PostListSkeleton } from "./PostListSkeleton";
import styles from "./PostList.module.css";

const PAGE_SIZE = 20;

const EMPTY_MESSAGES: Record<string, string> = {
  all: "还没有帖子，来发第一帖吧。",
  hot: "暂无热门帖子。",
  casual: "暂无灌水帖，来闲聊吧。",
  study: "暂无学习帖，来分享知识吧。",
  notice: "暂无公告。",
  ticket: "暂无工单，有需求就来提。",
};

type Props = {
  initialItems: Post[];
  initialTotal: number;
  tab: NavTabSlug;
};

function searchPosts(items: Post[], query: string): Post[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter(
    (p) => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)
  );
}

export function PostList({ initialItems, initialTotal, tab }: Props) {
  const [allItems, setAllItems] = useState<Post[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const { query } = useSearch();

  const tabFiltered = useMemo(() => filterPostsByTab(allItems, tab), [allItems, tab]);
  const visible = useMemo(() => searchPosts(tabFiltered, query), [tabFiltered, query]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPostList(allItems.length, PAGE_SIZE);
      setAllItems((prev) => [...prev, ...data.items]);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [allItems.length]);

  useEffect(() => {
    setAllItems(initialItems);
    setTotal(initialTotal);
    setError(null);
  }, [initialItems, initialTotal]);

  if (visible.length === 0) {
    const message = query.trim()
      ? `没有找到包含"${query}"的帖子`
      : EMPTY_MESSAGES[tab] ?? "该分区暂无帖子。";
    return <p className={styles.empty}>{message}</p>;
  }

  return (
    <>
      <ul className={styles.list}>
        {visible.map((p) => (
          <li key={p.id}>
            <Link href={`/post/${p.id}`} className={styles.card}>
              <div className={styles.cardHead}>
                <span>#{p.id}</span>
                <span className={styles.badge}>{categoryLabel(p.category)}</span>
                <time dateTime={p.created_at}>{formatRelativeTime(p.created_at)}</time>
              </div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardBody}>{p.body}</p>
            </Link>
          </li>
        ))}
      </ul>

      {error ? (
        <div className={styles.loadMore}>
          <p className={styles.loadMoreInfo} style={{ color: "var(--fg)" }}>{error}</p>
          <button className={styles.loadMoreBtn} onClick={loadMore}>重试</button>
        </div>
      ) : allItems.length < total && !query.trim() ? (
        <div className={styles.loadMore}>
          <button className={styles.loadMoreBtn} onClick={loadMore} disabled={loading}>
            {loading ? "加载中…" : "加载更多"}
          </button>
          <p className={styles.loadMoreInfo}>
            已加载 {allItems.length} / {total} 条
          </p>
        </div>
      ) : null}

      {loading ? <PostListSkeleton count={3} /> : null}
    </>
  );
}
