require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No GEMINI_API_KEY found in .env");
    return;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();

    if (data.error) {
      console.error("API Error:", data.error.message);
      return;
    }

    console.log("\n--- Available models for your API key ---");
    const available = data.models
      ?.filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name.replace('models/', ''));

    console.log(available);
  } catch (err) {
    console.error("Network / Fetch Error:", err.message);
  }
}

listModels();
