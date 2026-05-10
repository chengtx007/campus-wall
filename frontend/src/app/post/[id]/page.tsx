import Link from "next/link";
import type { Metadata } from "next";
import { fetchPostById, formatRelativeTime } from "@/lib/posts";
import { categoryLabel } from "@/lib/categories";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) return { title: "帖子不存在 — 校园墙" };
    const post = await fetchPostById(id);
    return { title: `${post.title} — 校园墙` };
  } catch {
    return { title: "帖子不存在 — 校园墙" };
  }
}

export default async function PostDetailPage({ params }: Props) {
  const id = parseInt((await params).id, 10);

  if (isNaN(id)) {
    return (
      <main className={styles.main}>
        <p className={styles.error}>无效的帖子 ID。</p>
        <div className={styles.footer}>
          <Link className={styles.backLink} href="/">← 返回首页</Link>
        </div>
      </main>
    );
  }

  try {
    const post = await fetchPostById(id);

    return (
      <main className={styles.main}>
        <Link className={styles.backLink} href="/">← 返回首页</Link>
        <article className={styles.card}>
          <div className={styles.head}>
            <span>#{post.id}</span>
            <span className={styles.badge}>{categoryLabel(post.category)}</span>
            <time dateTime={post.created_at}>{formatRelativeTime(post.created_at)}</time>
          </div>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.body}>{post.body}</p>
        </article>
        <div className={styles.footer}>
          <Link className={styles.backLink} href="/">← 返回首页</Link>
        </div>
      </main>
    );
  } catch (e) {
    return (
      <main className={styles.main}>
        <p className={styles.error}>{e instanceof Error ? e.message : "加载失败"}</p>
        <div className={styles.footer}>
          <Link className={styles.backLink} href="/">← 返回首页</Link>
        </div>
      </main>
    );
  }
}
