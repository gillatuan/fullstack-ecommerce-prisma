import { AUTHENTICATION_COOKIE } from "constants/common";
import { cookies } from "next/headers";

export default async function authenticated() {
  return !!( await cookies() ).get(AUTHENTICATION_COOKIE)?.value;
}