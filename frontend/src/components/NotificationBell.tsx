"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Notification } from "@/lib/posts";
import {
  fetchNotifications,
  fetchUnreadCount,
  formatRelativeTime,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/posts";
import { getStoredToken } from "@/lib/auth";
import styles from "./NotificationBell.module.css";

const TYPE_LABELS: Record<string, string> = {
  like: "赞了你的帖子",
  comment: "评论了你的帖子",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const token = useRef(getStoredToken());
  const ref = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const load = useCallback(async () => {
    if (!token.current) return;
    const [data, count] = await Promise.all([
      fetchNotifications(token.current),
      fetchUnreadCount(token.current),
    ]);
    setNotifs(data);
    setUnread(count);
  }, []);

  useEffect(() => {
    token.current = getStoredToken();
    if (!token.current) return;
    load();
    pollRef.current = setInterval(load, 30000);
    return () => clearInterval(pollRef.current);
  }, [load]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = async () => {
    setOpen((v) => !v);
    if (!open) await load();
  };

  const handleRead = async (n: Notification) => {
    if (!n.is_read && token.current) {
      await markNotificationRead(n.id, token.current);
      setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      setUnread((c) => Math.max(0, c - 1));
    }
  };

  const handleReadAll = async () => {
    if (!token.current) return;
    await markAllNotificationsRead(token.current);
    setNotifs((prev) => prev.map((x) => ({ ...x, is_read: true })));
    setUnread(0);
  };

  if (!token.current) return null;

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.bell} onClick={handleOpen} aria-label="通知">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && <span className={styles.badge}>{unread > 99 ? "99+" : unread}</span>}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropHead}>
            <span>通知</span>
            {unread > 0 && (
              <button className={styles.readAll} onClick={handleReadAll}>
                全部已读
              </button>
            )}
          </div>
          <div className={styles.list}>
            {notifs.length === 0 ? (
              <p className={styles.empty}>暂无通知</p>
            ) : (
              notifs.map((n) => (
                <Link
                  key={n.id}
                  href={`/post/${n.post_id}`}
                  className={`${styles.item} ${!n.is_read ? styles.unread : ""}`}
                  onClick={() => handleRead(n)}
                >
                  <span className={styles.dot} />
                  <div className={styles.body}>
                    <span className={styles.text}>
                      <strong>{n.from_nickname || n.from_username || "匿名用户"}</strong>
                      {" "}{TYPE_LABELS[n.type] || n.type}
                    </span>
                    <time className={styles.time}>{formatRelativeTime(n.created_at)}</time>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
