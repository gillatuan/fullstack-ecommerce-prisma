"use client"

import React, { useState } from 'react'
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import useAuth from 'app/auth/useAuth'

type Props = {
  userId: string;
  roles?: string[];
}

export default function EditUserRoles({ userId, roles = [] }: Props) {
  const { user } = useAuth();
  const [role, setRole] = useState<string>((roles[0]) || 'USER');

  if (!user || !user.roles?.includes('ADMIN')) return null;

  const handleSubmit = async () => {
    const API_URL = (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL as string);
    const API_VERSION = (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_VERSION || (process.env.NEXT_PUBLIC_VERSION as string);
    await fetch(`${API_URL}/${API_VERSION}/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ roles: [role] }),
    });
    window.location.reload();
  }

  return (
    <div>
      <FormControl size="small">
        <InputLabel id="role-select-label">Role</InputLabel>
        <Select labelId="role-select-label" value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
          <MenuItem value={'USER'}>USER</MenuItem>
          <MenuItem value={'ADMIN'}>ADMIN</MenuItem>
        </Select>
      </FormControl>
      <Button onClick={handleSubmit} variant="contained" size="small">Save</Button>
    </div>
  )
}
