"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SearchInput.module.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchInput({ value, onChange }: Props) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (next: string) => {
    setLocal(next);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(next), 300);
  };

  const handleClear = () => {
    setLocal("");
    clearTimeout(timerRef.current);
    onChange("");
  };

  return (
    <div className={styles.wrap}>
      <span className={styles.icon} aria-hidden="true">&#x1F50D;</span>
      <input
        className={styles.input}
        type="text"
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="搜索帖子…"
        aria-label="搜索帖子"
      />
      {local ? (
        <button className={styles.clearBtn} onClick={handleClear} aria-label="清除搜索">
          &times;
        </button>
      ) : null}
    </div>
  );
}
