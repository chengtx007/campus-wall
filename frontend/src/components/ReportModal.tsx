"use client";

import { useEffect, useRef, useState } from "react";
import { submitReport } from "@/lib/posts";
import { getFingerprint } from "@/lib/fingerprint";
import styles from "./ReportModal.module.css";

type Props = {
  postId: number;
  open: boolean;
  onClose: () => void;
};

export function ReportModal({ postId, open, onClose }: Props) {
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setReason("");
      setMsg(null);
      setIsError(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = reason.trim();
    if (!text) return;
    setPending(true);
    setMsg(null);
    try {
      await submitReport(postId, text, getFingerprint());
      setIsError(false);
      setMsg("举报已提交，管理员将尽快处理。");
      setTimeout(onClose, 1500);
    } catch (err) {
      setIsError(true);
      setMsg(err instanceof Error ? err.message : "举报失败");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-label="举报帖子">
        <h3 className={styles.title}>举报帖子 #{postId}</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="请描述举报原因…"
            maxLength={500}
            rows={4}
            required
          />
          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              取消
            </button>
            <button className={styles.submit} type="submit" disabled={pending || !reason.trim()}>
              {pending ? "提交中…" : "提交举报"}
            </button>
          </div>
          {msg ? (
            <p className={`${styles.msg} ${isError ? styles.msgError : ""}`}>{msg}</p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
