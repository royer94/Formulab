// Vercel Serverless Function
// Recibe { messages, system, maxTokens } desde el cliente y llama a Groq
// usando la API key guardada como variable de entorno (nunca expuesta al navegador).

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "GROQ_API_KEY no configurada en el servidor" });
  }

  const { messages, system, maxTokens } = req.body || {};
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "'messages' es requerido y debe ser un array" });
  }

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + key
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        max_tokens: maxTokens || 1500,
        messages: [{ role: "system", content: system || "" }, ...messages]
      })
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      return res.status(groqRes.status).json({ error: data?.error?.message || "Error de Groq" });
    }

    const content = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ content });

  } catch (err) {
    return res.status(500).json({ error: err.message || "Error interno" });
  }
}
