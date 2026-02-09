import { API_URL, API_VERSION } from "constants/common";
import { cookies } from "next/headers";
import { getErrorMessage } from "./errors";
import { LoginFormSchemaType } from "schemas/authSchema";

const getHeaders = async () => ({
  Cookie: (await cookies()).toString(),
});

export const post = async (path: string, data: LoginFormSchemaType) => {
  const url = `${API_URL}/${API_VERSION}/${path}`;

  const doRequest = async () => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await getHeaders()) },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return res;
  };

  let res = await doRequest();

  // If access token expired, attempt refresh once then retry
  if (res.status === 401) {
    await attemptRefresh();
    res = await doRequest();
  }

  const parsedRes = await res.json();
  if (!res.ok) {
    return { error: getErrorMessage(parsedRes), data: null };
  }
  return { error: "", data: parsedRes, response: res };
};

export const get = async (path: string) => {
  const url = `${API_URL}/${path}`;

  const doRequest = async () => {
    return fetch(url, {
      headers: { ...(await getHeaders()) },
      credentials: 'include',
    });
  };

  let res = await doRequest();
  if (res.status === 401) {
    await attemptRefresh();
    res = await doRequest();
  }

  return res.json();
};

async function attemptRefresh() {
  try {
    const refreshUrl = `${API_URL}/${API_VERSION}/auth/refresh`;
    const r = await fetch(refreshUrl, { method: 'POST', credentials: 'include' });
    return r.ok;
  } catch (e) {
    return false;
  }
}