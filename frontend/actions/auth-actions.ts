'use server'

export async function signup(pevData: any, formData: FormData) {
  // const email = formData.get('email') as string;
  // const password = formData.get('password') as string;

  // Here you would typically handle the signup logic,
  // such as validating input, hashing the password,
  // and storing the user in the database.

  // console.log('Signing up user with email:', email);
  // Simulate async operation
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_VERSION}/users`, {
    method: 'POST',
    body: JSON.stringify(formData),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const parsedRes = await res.json();
  if (!res.ok) {
    return { error: 'error', ...parsedRes };
  }

  return { error: '', ...parsedRes };
}
