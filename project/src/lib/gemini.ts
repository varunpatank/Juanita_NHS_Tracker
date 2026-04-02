const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function checkContentAppropriate(text: string): Promise<boolean> {
  try {
    // Check if API key is available
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.warn('Gemini API key not configured, using basic content filtering');
      // Basic inappropriate content check
      const inappropriateWords = ['spam', 'scam', 'fake', 'illegal', 'drugs', 'alcohol'];
      const lowerText = text.toLowerCase();
      return !inappropriateWords.some(word => lowerText.includes(word));
    }

    const prompt = `
    Analyze this text for a high school volunteer opportunity posting:
    "${text}"
    
    Check if it contains:
    - Inappropriate language or content
    - Spam or promotional content
    - Potentially harmful activities
    - Non-volunteer related content
    
    Respond with only "APPROPRIATE" or "INAPPROPRIATE"
    `;

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      return true; // Default to appropriate if API fails
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text.toUpperCase();
    
    return responseText.includes('APPROPRIATE');
  } catch (error) {
    console.error('Content moderation error:', error);
    return true; // Default to appropriate if error
  }
}
