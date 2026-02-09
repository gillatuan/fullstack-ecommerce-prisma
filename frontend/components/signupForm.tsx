"use client"

import createUser from "@/auth/signup/create-user";
import { SignupFormState } from "types/auth";
import { Button, Link, Stack, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import NextLink from "next/link";
import { useActionState, useState, useEffect } from "react";
import useAuth from "app/auth/useAuth";
import { rolePermissions } from 'constants/rolePermissions';

export default function SignupForm () {
  const initialState: SignupFormState = { error: { name: "", email: "", password: "" } };

  const [ state, formAction, isPending ] = useActionState( createUser, initialState );
  const [ loginValue, setLoginValue ] = useState( { name: "", email: "", password: "" } );
  const { user } = useAuth();
  const [ roleSelection, setRoleSelection ] = useState<string>('USER');
  const [permissionsPreview, setPermissionsPreview] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.roles?.includes('ADMIN')) return;
    let mounted = true;
    const controller = new AbortController();
    const fetchPermissions = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/roles/by-name/${roleSelection}`;
        const res = await fetch(url, { credentials: 'include', signal: controller.signal });
        if (!res.ok) {
          if (mounted) setPermissionsPreview([]);
          return;
        }
        const data = await res.json();
        const perms = (data.permissions || []).map((p: any) => p.permission?.name || p.permission?.id || p.permission?.key);
        if (mounted) setPermissionsPreview(perms);
      } catch (e) {
        if (mounted) setPermissionsPreview([]);
      }
    };
    fetchPermissions();
    return () => { mounted = false; controller.abort(); };
  }, [roleSelection, user]);

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
        {user?.roles?.includes('ADMIN') && (
          <FormControl fullWidth>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              label="Role"
              name="role"
              value={roleSelection}
              onChange={(e) => setRoleSelection(e.target.value)}
            >
              <MenuItem value={'USER'}>USER</MenuItem>
              <MenuItem value={'ADMIN'}>ADMIN</MenuItem>
            </Select>
          </FormControl>
        )}
        {user?.roles?.includes('ADMIN') && (
          <div className="w-full text-sm text-gray-500">
            <strong>Permissions preview:</strong>
            <ul className="list-disc pl-6">
              {(permissionsPreview.length ? permissionsPreview : (rolePermissions[roleSelection] || [])).map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}
        {/* ensure role is submitted in the form */}
        <input type="hidden" name="role" value={roleSelection} />
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
        <Button type="submit" variant="contained" disabled={isPending}>Signup</Button>
        <Link component={NextLink} href="/auth/signup" className="self-center">
          Signup
        </Link>
      </Stack>
    </form>
  );
}