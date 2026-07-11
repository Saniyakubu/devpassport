import type { PassportData } from "../types/passport";

export async function fetchPassportData(username: string): Promise<PassportData> {
  const response = await fetch(`/api/github/${encodeURIComponent(username)}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message ?? "Could not generate passport.");
  }

  return payload as PassportData;
}
