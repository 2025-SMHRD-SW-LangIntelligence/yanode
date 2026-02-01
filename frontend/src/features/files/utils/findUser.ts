export async function findUser(userId: string, globalValue: string): Promise<string> {
  try {
    const res = await fetch(`${globalValue}/api/dooray/userId?userId=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    const data = await res.text();
    return data ?? "-";
  } catch (e) {
    return "-";
  }
}