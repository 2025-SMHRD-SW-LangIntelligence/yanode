import { useGlobal } from "../../../types/GlobalContext";

export async function findUser(userId: string): Promise<string> {
  const { globalValue } = useGlobal();
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