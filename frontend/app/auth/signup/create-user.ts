"use server"

import { post } from "@/common/util/fetch"
import { SignupFormState } from "@/types/auth"
import { redirect } from "next/navigation"

export default async function createUser(
  _prevState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email) {
    return { error: { email: "Email is required" } }
  }

  if (!password) {
    return { error: { password: "Password is required" } }
  }

  const res = await post("users", formData)
  if (res.error) {
    return {
      message: res.error,
      data: null,
      error: { email: "", password: "" },
    }
  }

  redirect("/auth/login")
}
