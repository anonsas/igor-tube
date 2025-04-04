import { useRef, useState, useEffect } from "react";

export function useIntersectionObserver(options?: IntersectionObserverInit) {
  const targetRef = useRef<HTMLDivElement>(null);

  // to detect if a user has reached a bottom of a list, so we can safely initiate a function call
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return { targetRef, isIntersecting };
}
