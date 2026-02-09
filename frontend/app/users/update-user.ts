"use server"

import { cookies } from "next/headers";
import { API_URL, API_VERSION } from "constants/common";
import { getErrorMessage } from "common/util/errors";

export default async function updateUser(userId: string, formData: FormData) {
  const role = formData.get('role');
  const payload: any = {};
  if (formData.get('name')) payload.name = String(formData.get('name'));
  if (formData.get('email')) payload.email = String(formData.get('email'));
  if (formData.get('password')) payload.password = String(formData.get('password'));
  if (role) payload.roles = [String(role)];
  if (role) payload.roles = [String(role)];

  const res = await fetch(`${API_URL}/${API_VERSION}/users/${userId}`, {
    method: 'PATCH',
    headers: {
      "Content-Type": "application/json",
      Cookie: (await cookies()).toString(),
    },
    body: JSON.stringify(payload),
  });

  const parsed = await res.json();
  if (!res.ok) {
    return { error: getErrorMessage(parsed), data: null };
  }
  return { error: '', data: parsed };
}
