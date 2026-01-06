function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;

    // Here you would typically add the email to your newsletter list
    // For demonstration, we'll just return a success message

    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Email is required and must be valid' });
      return
    } else {
      console.log('email', email);
      res.status(201).json({ message: `Subscribed ${email} to the newsletter!` });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default handler;