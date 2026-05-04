export async function POST(req) {
  try {
    const { surveyText } = await req.json();
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return Response.json({ error: "API Key is missing from .env.local" }, { status: 500 });
    }

    // UPDATED FOR APRIL 2026: Using the ultra-efficient 3.1 Flash-Lite model
    // This model is optimized to avoid "High Demand" errors on the free tier.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${API_KEY}`;

    const payload = {
      contents: [{
        parts: [{
          text: `You are a Survey Methodology Expert. Please analyze the following questionnaire:
          "${surveyText}"
          
          Review the following:
          1. Screening: Review the 18+ age and cricket watching criteria.
          2. Brand Associations: Critique the list in Q10 (Asian Paints, TATA, etc.).
          3. Logic: Check the 'Main Earner' routing for Q12-Q14.`
        }]
      }]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.error) {
      console.error("API Error Details:", data.error);
      return Response.json({ error: data.error.message }, { status: 500 });
    }

    if (!data.candidates || !data.candidates[0].content) {
      return Response.json({ error: "AI returned an empty response. Try refreshing." }, { status: 500 });
    }

    return Response.json({ feedback: data.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error("Fetch Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}