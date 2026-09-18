"use client";

import { useEffect, useState } from "react";

export function ErrorToast({ message }: { message?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) { setVisible(false); return; }
    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), 5000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  if (!message || !visible) return null;
  return <div className="errorToast" role="alert"><span>Check dimensions</span><p>{message}</p><button type="button" onClick={() => setVisible(false)} aria-label="Dismiss error">×</button></div>;
}
