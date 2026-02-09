"use server"

import { post } from "common/util/fetch"
// Backend sets HttpOnly authentication cookie; no direct token handling here
import { loginFormSchema } from "schemas/authSchema"
import { LoginFormState } from "types/auth"
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

  // Backend sets HttpOnly cookies; frontend should not read tokens.
  // The backend also returns the user profile payload in `res.data.user`.
  // We simply redirect on success and let the layout /auth/me endpoint
  // obtain the current user from the cookie.

  redirect("/")
}
