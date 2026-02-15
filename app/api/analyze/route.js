export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: { message: "API key not configured" } }, { status: 500 });
  }

  try {
    const body = await request.json();

    // Validate model is one of allowed models
    const allowedModels = [
      "claude-sonnet-4-20250514",
      "claude-opus-4-20250514",
    ];
    if (!allowedModels.includes(body.model)) {
      body.model = "claude-sonnet-4-20250514";
    }

    // Cap max_tokens
    body.max_tokens = Math.min(body.max_tokens || 8000, 8000);

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "pdfs-2024-09-25",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    return Response.json(data, { status: resp.status });
  } catch (e) {
    return Response.json(
      { error: { message: "Proxy error: " + e.message } },
      { status: 500 }
    );
  }
}
