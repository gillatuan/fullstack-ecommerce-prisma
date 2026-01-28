'use client'

import login from "@/auth/login/login";
import { LoginFormState } from "types/auth";
import { Button, Link, Stack, TextField } from "@mui/material";
import NextLink from "next/link";
import { useActionState, useState } from "react";

const initialState: LoginFormState = { error: { email: "", password: "" } };

export default function LoginForm () {
  const [ state, formAction, isPending ] = useActionState( login, initialState );
  const [ loginValue, setLoginValue ] = useState( { email: "", password: "" } );

  return (
    <form action={formAction} className="rounded-lg" noValidate>
      {!state.data && state.message && (
        <div className="text-red-500 mb-4">{state.message}</div>
      )}

      {state.data && (
        <div className="text-green-500 mb-4">Login successful!</div>
      )}
      <Stack spacing={2} className="w-150 grid grid-cols-1 justify-items-center p-8 gap-4">
        <TextField
          error={!!state.error?.email}
          helperText={state.error?.email}
          name="email"
          label="Email"
          variant="outlined"
          type="email"
          value={loginValue.email}
          onChange={( e ) => setLoginValue( { ...loginValue, email: e.target.value } )}
        />
        <TextField
          error={!!state.error?.password}
          helperText={state.error?.password}
          name="password"
          label="Password"
          variant="outlined"
          type="password"
          value={loginValue.password}
          onChange={( e ) => setLoginValue( { ...loginValue, password: e.target.value } )}
        />
        <Button type="submit" variant="contained" disabled={isPending}>Login</Button>
        <Link component={NextLink} href="/auth/signup" className="self-center">
          Signup
        </Link>
      </Stack>
    </form>
  );
}