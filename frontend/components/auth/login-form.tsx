'use client';

import { signup } from "@/actions/auth-actions";
import classes from '@/components/auth/login-form.module.css';
import Link from 'next/link';
import { useActionState, useState, useTransition } from "react";

export const LoginForm = () => {
  const [state, setState] = useState({error: '', message: ''})
  const [isPending, startTransition] = useTransition();

  const onSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await signup({}, formData);
      setState({ error: result.error, message: result.message });
    });
  }

  return (
    <form id={classes.authForm} action={onSubmit}>
      <div className={classes['error-container']}><span>{state.error}</span></div>
      <div className={classes[ 'image-container' ]}>
        <img src="/images/auth-icon.jpg" alt="A lock icon" />
      </div>
      <p className={classes[ 'input-container' ]}>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" />
      </p>
      <p className={classes[ 'input-container' ]}>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
      </p>
      <p className={classes[ 'button-container' ]}>
        <button type="submit" disabled={isPending}>
          Create Account
        </button>
      </p>
      <p>
        <Link href="/">Login with existing account.</Link>
      </p>
    </form>
  );
}
