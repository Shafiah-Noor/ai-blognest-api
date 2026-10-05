const { GoogleGenerativeAI } = require('@google/generative-ai');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Calling Gemini (${modelName})... Attempt ${attempt + 1}`);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Invalid Gemini response: empty output received');
      }

      return text;
    } catch (error) {
      const message = error?.message || '';

      // Check for temporary server-side throttling or demand spikes
      const isTemporaryError =
        message.includes('503') ||
        message.includes('429') ||
        message.includes('high demand') ||
        message.includes('Service Unavailable') ||
        message.includes('rate limit');

      if (!isTemporaryError || attempt === maxRetries) {
        console.error(`Gemini API failure (${modelName}):`, message);
        throw error;
      }

      // Exponential backoff: 2s, 4s, 8s
      const delay = 2000 * Math.pow(2, attempt);
      console.warn(`Model busy/throttled. Retrying in ${delay / 1000}s (Attempt ${attempt + 1}/${maxRetries})...`);
      await sleep(delay);
    }
  }
};

module.exports = {
  callGemini,
};