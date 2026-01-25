import { API_URL } from "../helpers/api-util";

export async function CreateNewsletter(pevData, formData) {
  const email = formData.get('email');

  // Here you would typically handle the newsletter subscription logic,
  // such as validating input and storing the email in the database.

  // console.log('Subscribing to newsletter with email:', email);
  const res = await fetch(`${API_URL}/newsletter`, {
    method: 'POST',
    body: JSON.stringify(formData),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}