'use client'

import createUser from "@/auth/signup/create-user";
import { SignupFormState } from "types/auth";
import { Button, Link, Stack, TextField } from "@mui/material";
import NextLink from "next/link";
import { useActionState, useState } from "react";

export default function SignupForm () {
  const initialState: SignupFormState = { error: { name: "", email: "", password: "" } };

  const [ state, formAction, isPending ] = useActionState( createUser, initialState );
  const [ loginValue, setLoginValue ] = useState( { name: "", email: "", password: "" } );

  return (
    <form action={formAction} className="rounded-lg" noValidate>
      {!state.data && state.message && (
        <div className="text-red-500 mb-4">{state.message}</div>
      )}

      {state.data && (
        <div className="text-green-500 mb-4">Signup successful!</div>
      )}
      <Stack spacing={2} className="w-150 grid grid-cols-1 justify-items-center p-8 gap-4">
        <TextField
          error={!!state.error?.name}
          helperText={state.error?.name}
          name="name"
          label="Name"
          variant="outlined"
          type="text"
          value={loginValue.name}
          onChange={( e ) => setLoginValue( { ...loginValue, name: e.target.value } )}
        />
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