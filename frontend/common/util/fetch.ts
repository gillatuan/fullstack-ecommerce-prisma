import { API_URL, API_VERSION } from "@/constants/common";
import { cookies } from "next/headers";
import { getErrorMessage } from "./errors";

const getHeaders = async () => ({
  Cookie: (await cookies()).toString(),
});

export const post = async (path: string, formData: FormData) => {
  const res = await fetch(`${API_URL}/${API_VERSION}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await getHeaders()) },
    body: JSON.stringify(Object.fromEntries(formData)),
  });
  const parsedRes = await res.json();
  if (!res.ok) {
    return { error: getErrorMessage(parsedRes), data: null };
  }
  return { error: "", data: parsedRes };
};

export const get = async (path: string) => {
  const res = await fetch(`${API_URL}/${path}`, {
    headers: { ...(await getHeaders()) },
  });
  return res.json();
};