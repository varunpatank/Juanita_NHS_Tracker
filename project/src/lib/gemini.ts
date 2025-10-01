const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function verifyVolunteerActivity(description: string, imageFile: File): Promise<{ isValid: boolean; reason?: string }> {
  try {
    // Check if API key is available
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.warn('Gemini API key not configured, using basic validation');
      return {
        isValid: false,
        reason: 'API verification unavailable. Please ensure your description clearly explains your service activity and how your image evidence supports it.'
      };
    }

    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    const prompt = `
    You are an AI verifying volunteer service submissions for a high school National Honor Society chapter. You MUST analyze the actual image content and compare it to the student's description.

    Student's Description: "${description}"

    ANALYSIS REQUIREMENTS:

    1. VISUAL ANALYSIS: First, describe what you actually see in the image:
       - What people, objects, locations, activities are visible?
       - What is the setting/environment?
       - Are there any signs, text, uniforms, or identifying features?
       - What specific details can you observe?

    2. DESCRIPTION ANALYSIS: What does the student claim:
       - What specific service activity do they say they performed?
       - How do they explain the image shows evidence of this activity?
       - What connection do they make between the visual content and their service?

    3. VERIFICATION: Compare image content to description:
       - Does what you see in the image match what they describe?
       - Is the setting consistent with their claimed activity?
       - Do visible elements support their service claims?
       - Are there contradictions between image and description?

    4.

    STRICT CRITERIA FOR APPROVAL:
    ✓ Student describes specific volunteer/service activity they performed
    ✓ Student explains how the image demonstrates this activity
    ✓ Image actually shows visual evidence that matches their description
    ✓ Setting, people, objects, or activities visible support their claims
    ✓ No contradictions between what's visible and what's described

    AUTOMATIC REJECTION IF:
    ✗ Description is vague ("I helped people" without specifics)
    ✗ No explanation of how image relates to service
    ✗ Image shows completely different content than described
    ✗ Setting doesn't match claimed activity location
    ✗ No visible service-related evidence in image
    ✗ Random/personal photos unrelated to service
    ✗ Obvious mismatches between visual content and claims
    ✗ THIS IS VERY IMPORTANT - IF IT LOOKS LIKE AN ONLINE OR AI GENERATED IMAGE, DECLINE. It should match the description.

    PROVIDE DETAILED FEEDBACK:
    - If APPROVED: Explain what you see that confirms their service
    - If REJECTED: Explain specifically what you see vs. what they claim, and what's missing or inconsistent

    Respond with JSON:
    {
      "isValid": boolean,
      "reason": "Detailed explanation of what you see in the image and how it relates (or doesn't relate) to their description. Be specific about visual elements."
    }
    `;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: imageFile.type,
              data: base64Image.split(',')[1]
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1500
      }
    };

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Try to parse JSON response
    try {
      const result = JSON.parse(responseText);
      return {
        isValid: result.isValid,
        reason: result.reason || (result.isValid ? 'Evidence supports your service description.' : 'Your evidence does not sufficiently support your service description.')
      };
    } catch {
      // Fallback parsing - be very strict
      const isValid = responseText.toLowerCase().includes('"isvalid": true') || 
                     responseText.toLowerCase().includes('"isvalid":true');
      
      // Extract reason from response if possible
      let reason = 'Unable to parse verification response.';
      const reasonMatch = responseText.match(/"reason":\s*"([^"]+)"/);
      if (reasonMatch) {
        reason = reasonMatch[1];
      } else if (!isValid) {
        reason = 'Your image does not clearly show the service activity you described. Please ensure your photo demonstrates the specific volunteer work you performed and matches your written description.';
      }
      
      return {
        isValid,
        reason
      };
    }
  } catch (error) {
    console.error('Gemini verification error:', error);
    return {
      isValid: false,
      reason: 'Unable to verify your submission due to a technical error. Please ensure your image clearly shows the service activity you describe and try again.'
    };
  }
}

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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}