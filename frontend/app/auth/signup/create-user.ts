"use server"

import { post } from "common/util/fetch"
import { SignupFormState } from "types/auth"
import { redirect } from "next/navigation"
import { signUpFormSchema } from "schemas/authSchema";

export default async function createUser(
  _prevState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const validatedFields = signUpFormSchema.safeParse({
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

  const res = await post("users", validatedFields.data)
  if (res.error) {
    return {
      message: res.error,
      data: null,
      error: { email: "", password: "" },
    }
  }

  redirect("/auth/login")
}
