export function handler(req, res) {
  const { eventId } = req.query

  if (req.method === "POST") {
    const { email, name, text } = req.body
    
    // Add server-side validation for the comment data
    if (
      !email ||
      !email.includes("@") ||
      !name ||
      name.trim() === "" ||
      !text ||
      text.trim() === ""
    ) {
      res.status(400).json({ error: "Invalid input. Please check your data." })
      return
    }

    const newComment = {
      id: new Date().toISOString(),
      eventId,
      email,
      name,
      text,
    }

    // Here you would typically store the new comment in your database
    // For demonstration, we'll just log it and return a success message

    console.log("New comment added:", newComment)
    res
      .status(201)
      .json({ message: "Comment added successfully!", comment: newComment })
  } else if (req.method === "GET") {
    // Here you would typically fetch comments for the given eventId from your database
    // For demonstration, we'll return a static list of comments

    const comments = [
      {
        id: "c1",
        eventId,
        email: "<EMAIL>",
        name: "<NAME>",
        text: "This is a sample comment.",
      },
      {
        id: "c2",
        eventId,
        email: "<EMAIL>",
        name: "<NAME>",
        text: "Another sample comment.",
      },
    ]

    res.status(200).json({ comments })
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}
