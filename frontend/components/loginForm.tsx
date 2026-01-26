'use client';


import { login } from '@/actions/auth';
import { useActionState } from 'react';


const initialState = { error: '', success: undefined };


export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);


  return (
    <form action={formAction}>
      <input name="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />


      <button disabled={isPending}>Login</button>


      {state.error && <p>{state.error}</p>}
    </form>
  );
}