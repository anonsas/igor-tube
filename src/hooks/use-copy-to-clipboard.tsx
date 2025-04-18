import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";

export function useCopyToClipboard(timeout = 2000) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success("Copied to clipboard!");

      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, timeout);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { isCopied, copy };
}
