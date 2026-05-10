import styles from "./PostList.module.css";

export function PostListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <ul className={styles.list}>
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <article className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.skeletonLine} style={{ width: "2.5rem" }} />
              <span className={styles.skeletonLine} style={{ width: "3.5rem" }} />
              <span className={styles.skeletonLine} style={{ width: "5rem" }} />
            </div>
            <div className={styles.skeletonLine} style={{ width: "60%", height: "1.2rem", marginBottom: "0.5rem" }} />
            <div className={styles.skeletonLine} style={{ width: "100%" }} />
            <div className={styles.skeletonLine} style={{ width: "75%" }} />
          </article>
        </li>
      ))}
    </ul>
  );
}
