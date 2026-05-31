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
    if (!id) return;
    
    setLoading(true);
    setError(null);

    // Swap this path for your API endpoint in the future
    fetch('/scroll/scrolls.json')
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
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
};