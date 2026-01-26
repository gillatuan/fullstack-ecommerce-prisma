'use client'

import { signup } from "@/actions/auth";
import { Button, Link, Stack, TextField } from "@mui/material";
import NextLink from "next/link";
import { useActionState } from "react";

export default function Signup() {
	const [state, action, pending] = useActionState(signup, undefined)

	return (
		<form action={action}>
			<Stack spacing={2} className="w-full max-w-xs">
				<TextField label="Email" variant="outlined" type="email" />
				{state?.errors?.email && <p>{state.errors.email}</p>}

				<TextField label="Password" variant="outlined" type="password" />
				{state?.errors?.password && (
					<div>
						<p>Password must:</p>
						<ul>
							{state.errors.password.map((error) => (
								<li key={error}>- {error}</li>
							))}
						</ul>
					</div>
				)}
				
				<Button variant="contained" disabled={pending} type="submit">Signup</Button>
				<Link component={NextLink} href="/auth/login" className="self-center">
					Login
				</Link>
			</Stack>
		</form>
	);
}