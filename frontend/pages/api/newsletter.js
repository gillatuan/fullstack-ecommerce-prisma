export async function handler(req, res) {
  if (req.method === "POST") {
    const { email } = req.body

    // Here you would typically add the email to your newsletter list
    // For demonstration, we'll just return a success message

    if (!email || !email.includes("@")) {
      res.status(400).json({ error: "Email is required and must be valid" })
      return
    } else {
      console.log("email", email)
      const result = await fetch(process.env.NEXT_PUBLIC_API_URL + "/newsletter", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (result.ok) {
        res.status(201).json({ message: "Signed up successfully!", data: result })
      } else {
        res.status(500).json({ error: "Failed to sign up for newsletter" })
      }
    }
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}

export default handler
