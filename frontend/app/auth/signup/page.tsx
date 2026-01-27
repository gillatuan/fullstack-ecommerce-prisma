'use client'

import { Button, Link, Stack, TextField } from "@mui/material";
import NextLink from "next/link";
import { useActionState } from "react";
import createUser from "./create-user";
import SignupForm from "@/components/signupForm";

export default function Signup() {
	return (
		<SignupForm />
	);
}