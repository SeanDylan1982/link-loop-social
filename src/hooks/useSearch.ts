import { useState, useEffect } from 'react';
import * as api from '@/api/api';

export const useSearch = (query: string) => {
  const [results, setResults] = useState({ posts: [], topics: [], users: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (!query) {
        setResults({ posts: [], topics: [], users: [] });
        return;
      }

      setLoading(true);
      try {
        const res = await api.request(`/api/search?query=${query}`);
        setResults(res);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [query]);

  return { results, loading };
};
