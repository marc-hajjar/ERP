import { useState, useEffect, useCallback } from 'react';

export function useApi(endpoint) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res  = await fetch(`/api${endpoint}`, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.data ?? json);
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  }, [endpoint]);

  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, loading, error, refetch: fetchData };
}

export async function apiCall(endpoint, method = 'GET', body = null) {
  const res  = await fetch(`/api${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'API error');
  return json;
}