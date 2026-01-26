"use server";

import { FormError } from "@/common/form-error.interface";
import { post } from "@/common/util/fetch";
import { redirect } from "next/navigation";

export default async function createUser(
  _prevState: FormError,
  formData: FormData
) {
  const { error } = await post("users", formData);
  if (error) {
    return { error };
  }
  redirect("/");
}