"use client";

import { useEffect, useState } from "react";

export function useFullUrl(path: string) {
  const [fullUrl, setFullUrl] = useState("");

  // TODO: change if deploymenet will be outside VERCEL
  useEffect(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : process.env.VERCEL_URL || "http://localhost:3000";

    setFullUrl(`${origin}${path}`);
  }, [path]);

  return fullUrl;
}
