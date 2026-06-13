import { useState, useEffect } from 'react';

export interface ScrollData {
  title: string;
  content: string;
}

export const useScrollData = (id: string | null) => {
  const [data, setData] = useState<ScrollData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    const controller = new AbortController();
    
    setLoading(true);
    setError(null);

    // Swap this path for your API endpoint in the future
    setData(null);
    fetch('/scroll/scrolls.json', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch scroll data");
        return res.json();
      })
      .then((json) => {
        if (json[id]) {
          setData(json[id]);
        } else {
          setError("Scroll content not found.");
        }
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to fetch scroll data');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { data, loading, error };
};
