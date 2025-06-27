export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { password } = req.body;

  if (password === process.env.APP_PASSWORD) {
    // Set secure cookie (24 hours)
    res.setHeader(
      "Set-Cookie",
      "prd-auth=true; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/"
    );
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ message: "Invalid password" });
}
