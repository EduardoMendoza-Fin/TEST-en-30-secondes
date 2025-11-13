export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { firstName, lastName, email, phone, score, result } = req.body;

  try {
    const airtableRes = await fetch(
      "https://api.airtable.com/v0/appEdBdKmdBFgv2vW/tbllMxmqFj9MI5zIb",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            Prénom: firstName,
            Nom: lastName,
            Email: email,
            Téléphone: phone,
            Score: score,
            Résultat: result,
            Date: new Date().toISOString(),
          },
        }),
      }
    );

    if (!airtableRes.ok) {
      const text = await airtableRes.text();
      console.error(text);
      return res.status(500).json({ error: "Airtable error", details: text });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Serverless error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}