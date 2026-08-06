import { asyncHandler, ApiError } from '../middleware/error.js';
import Groq from 'groq-sdk';

export const generateProductDetails = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    throw new ApiError(400, 'Image URL is required');
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new ApiError(500, 'GROQ_API_KEY is not configured in the backend.');
  }

  const groq = new Groq({ apiKey });

  try {
    const prompt = `You are an AI assistant for a handmade crafts store called "Manju's Atelier".
Analyze this product image and generate a structured JSON object containing:
- "name": A catchy, SEO-friendly name for this product (max 60 characters).
- "description": A beautiful, compelling product description (1-2 paragraphs) highlighting its craftsmanship, aesthetic appeal, and potential uses.
- "category": Choose the single most appropriate category from: ['crochet', 'bags', 'home-decor', 'accessories', 'amigurumi', 'clothing']. If none fit perfectly, pick the closest one or suggest a simple 1-word lowercase category.
- "tags": An array of 3 to 6 relevant lowercase tags (e.g., ["handmade", "gift", "boho", "sustainable"]).

Return ONLY the raw JSON object. Do not include markdown code blocks or any other text.`;

    const response = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      temperature: 0.4,
      max_tokens: 512,
    });

    const aiMessage = response.choices[0].message.content;
    
    // Attempt to parse JSON. Sometimes LLMs return markdown anyway.
    let jsonStr = aiMessage.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.substring(7);
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.substring(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }

    const parsed = JSON.parse(jsonStr.trim());

    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Groq AI Error:', error);
    throw new ApiError(500, 'Failed to generate product details with AI. ' + (error.message || ''));
  }
});
