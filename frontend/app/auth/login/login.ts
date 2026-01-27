"use server"

import { post } from "@/common/util/fetch"
import { AUTHENTICATION_COOKIE } from "@/constants/common"
import { loginFormSchema } from "@/schemas/authSchema"
import { LoginFormState } from "@/types/auth"
import { jwtDecode } from "jwt-decode"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function login(
  _: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const validatedFields = loginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  // Return early if the form data is invalid
  if (!validatedFields.success) {
    return {
      error: {
        email: validatedFields.error.flatten().fieldErrors.email?.[0] || "",
        password: validatedFields.error.flatten().fieldErrors.password?.[0] || "",
      },
    };
  }

  const res = await post("auth/login", validatedFields.data)
  if (res.error) {
    return {
      message: res.error,
      data: null,
      error: { email: "", password: "" },
    }
  }

  const setCookieHeader = res.response?.headers.get("Set-Cookie")
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

  redirect("/")
}

/* const setAuthCookie = async (response: Response) => {
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
} */
