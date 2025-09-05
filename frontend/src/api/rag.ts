const BASE = import.meta.env.VITE_RAG_BASE ?? 'http://127.0.0.1:8000';

export async function askRag(query: string) {
  const res = await fetch(`${BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }), // 키는 query!
  });
  if (!res.ok) throw new Error(`ASK failed: ${res.status}`);
  return res.json() as Promise<{ answer: string }>;
}