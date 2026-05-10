"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Post, Report } from "@/lib/posts";
import {
  adminActOnPost, adminFetchPosts, adminFetchReports, adminResolveReport,
  clearAdminToken, formatRelativeTime, hasAdminToken,
} from "@/lib/posts";
import { categoryLabel } from "@/lib/categories";
import styles from "./page.module.css";

type Tab = "posts" | "reports";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postStatus, setPostStatus] = useState<string>("");
  const [reportFilter, setReportFilter] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (!hasAdminToken()) { router.push("/admin/login"); return; }
    loadData();
  }, [tab, postStatus, reportFilter]);

  const loadData = async () => {
    setLoading(true); setError(null);
    try {
      if (tab === "posts") setPosts(await adminFetchPosts(postStatus || undefined));
      else setReports(await adminFetchReports(reportFilter));
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally { setLoading(false); }
  };

  const handleActOnPost = async (postId: number, action: string) => {
    try { await adminActOnPost(postId, action); loadData(); }
    catch (e) { setError(e instanceof Error ? e.message : "操作失败"); }
  };

  const handleResolveReport = async (reportId: number, resolved: boolean) => {
    try { await adminResolveReport(reportId, resolved); loadData(); }
    catch (e) { setError(e instanceof Error ? e.message : "操作失败"); }
  };

  const handleLogout = () => { clearAdminToken(); router.push("/admin/login"); };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>管理后台</h1>
        <button className={styles.logout} onClick={handleLogout}>退出登录</button>
      </div>

      <div className={styles.tabs}>
        {(["posts", "reports"] as Tab[]).map((t) => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`} onClick={() => setTab(t)}>
            {t === "posts" ? "帖子管理" : "举报管理"}
          </button>
        ))}
      </div>

      {tab === "posts" && (
        <div className={styles.filterRow}>
          <select className={styles.select} value={postStatus} onChange={(e) => setPostStatus(e.target.value)}>
            <option value="">全部状态</option>
            <option value="approved">已通过</option>
            <option value="pending">待审核</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>
      )}
      {tab === "reports" && (
        <div className={styles.filterRow}>
          <select className={styles.select} value={reportFilter === undefined ? "all" : String(reportFilter)} onChange={(e) => { const v = e.target.value; setReportFilter(v === "all" ? undefined : v === "true"); }}>
            <option value="all">全部</option>
            <option value="false">未处理</option>
            <option value="true">已处理</option>
          </select>
        </div>
      )}

      {error ? <p className={styles.errorMsg}>{error}</p> : loading ? <p className={styles.loading}>加载中…</p> : tab === "posts" ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>标题</th><th>分区</th><th>状态</th><th>浏览</th><th>点赞</th><th>时间</th><th>操作</th></tr></thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td className={styles.mono}>#{p.id}</td>
                  <td><Link href={`/post/${p.id}`} className={styles.postLink}>{p.title.slice(0, 30)}{p.title.length > 30 ? "…" : ""}</Link></td>
                  <td className={styles.muted}>{categoryLabel(p.category)}</td>
                  <td><span className={`${styles.statusTag} ${p.status === "approved" ? styles.statusApproved : p.status === "pending" ? styles.statusPending : styles.statusRejected}`}>{p.status === "approved" ? "已通过" : p.status === "pending" ? "待审核" : "已拒绝"}</span></td>
                  <td className={styles.mono}>{p.view_count}</td>
                  <td className={styles.mono}>{p.like_count}</td>
                  <td className={styles.muted}>{formatRelativeTime(p.created_at)}</td>
                  <td>
                    <div className={styles.actionBtns}>
                      {p.status !== "approved" && <button className={styles.btnApprove} onClick={() => handleActOnPost(p.id, "approve")}>通过</button>}
                      {p.status !== "rejected" && <button className={styles.btnReject} onClick={() => handleActOnPost(p.id, "reject")}>拒绝</button>}
                      <button className={styles.btnDelete} onClick={() => { if (confirm(`确定删除帖子 #${p.id}？`)) handleActOnPost(p.id, "delete"); }}>删除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && <tr><td colSpan={8} className={styles.empty}>暂无数据</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>帖子ID</th><th>举报原因</th><th>举报人</th><th>时间</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td className={styles.mono}>#{r.id}</td>
                  <td className={styles.mono}><Link href={`/post/${r.post_id}`} className={styles.postLink}>#{r.post_id}</Link></td>
                  <td>{r.reason}</td>
                  <td className={styles.muted}>{r.fingerprint.slice(0, 8)}…</td>
                  <td className={styles.muted}>{formatRelativeTime(r.created_at)}</td>
                  <td>{r.resolved ? "已处理" : "未处理"}</td>
                  <td>{!r.resolved ? <div className={styles.actionBtns}><button className={styles.btnApprove} onClick={() => handleResolveReport(r.id, true)}>标记已处理</button></div> : <span className={styles.muted}>已处理</span>}</td>
                </tr>
              ))}
              {reports.length === 0 && <tr><td colSpan={7} className={styles.empty}>暂无数据</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
