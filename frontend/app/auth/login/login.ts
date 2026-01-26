"use server"

import { post } from "@/common/util/fetch"
import { FormResponse } from "@/types/form-response"
import { API_URL, API_VERSION, AUTHENTICATION_COOKIE } from "@/constants/common"
import { jwtDecode } from "jwt-decode"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function login(
  _prevState: FormResponse,
  formData: FormData,
) {
  const res = await post(`${API_URL}/${API_VERSION}/auth/login`, formData)
  if (res.error) {
    return { error: res.error }
  }
  await setAuthCookie(res.data as Response)

  redirect("/")
}

const setAuthCookie = async (response: Response) => {
  const setCookieHeader = response.headers.get("Set-Cookie")
  if (setCookieHeader) {
    const token = setCookieHeader.split(";")[0].split("=")[1]
    ;(await cookies()).set({
      name: AUTHENTICATION_COOKIE,
      value: token,
      secure: true,
      httpOnly: true,
      expires: new Date(jwtDecode(token).exp! * 1000),
    })
  }
}
