'use client'

import login from "@/app/auth/login/login";
import { Button, Link, Stack, TextField } from "@mui/material";
import NextLink from "next/link";
import { useActionState } from "react";

export default function Login () {
	const [ state, formAction, isPending ] = useActionState( login, { error: "" } );


	return (
		<form action={formAction} className="rounded-lg">
			<Stack spacing={2} className="w-150 grid grid-cols-1 justify-items-center p-8 gap-4">
				<TextField
					error={!!state.error}
					helperText={state.error}
					name="email"
					label="Email"
					variant="outlined"
					type="email"
				/>
				<TextField
					error={!!state.error}
					helperText={state.error}
					name="password"
					label="Password"
					variant="outlined"
					type="password"
				/>
				<Button type="submit" variant="contained" disabled={isPending}>Login</Button>
				<Link component={NextLink} href="/auth/signup" className="self-center">
					Signup
				</Link>
			</Stack>
		</form>
	);
}