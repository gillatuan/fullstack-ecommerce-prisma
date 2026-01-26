"use server";

import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getErrorMessage } from "@/app/common/util/errors";
import { API_URL, API_VERSION, AUTHENTICATION_COOKIE } from "@/constants/common";
import { FormResponse } from "@/app/types/form-response";

export default async function login(
  _prevState: FormResponse,
  formData: FormData
) {
  const res = await fetch(`${API_URL}/${API_VERSION}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.fromEntries(formData)),
  });
  const parsedRes = await res.json();
  if (!res.ok) {
    return { error: getErrorMessage(parsedRes) };
  }
  setAuthCookie(res);
  redirect("/");
}

const setAuthCookie = async (response: Response) => {
  const setCookieHeader = response.headers.get("Set-Cookie");
  if (setCookieHeader) {
    const token = setCookieHeader.split(";")[0].split("=")[1];
    ( await cookies() ).set({
      name: AUTHENTICATION_COOKIE,
      value: token,
      secure: true,
      httpOnly: true,
      expires: new Date(jwtDecode(token).exp! * 1000),
    });
  }
};