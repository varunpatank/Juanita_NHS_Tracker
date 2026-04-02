const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface ImageVerificationResult {
  isValid: boolean;
  error?: string;
  geminiAnalysis?: string;
  geminiReasoning?: string;
  suggestions?: string[];
}

/**
 * Build a strict verification prompt that checks each sentence-frame field against the image.
 */
function buildPrompt(description: string): string {
  return `You verify NHS volunteer hour photos. Be lenient. When in doubt, approve.

Student says: "${description}"

Rules:
- APPROVE if image somewhat relates to the description.
- APPROVE if there's any plausible connection to volunteering or the described setting.
- APPROVE signed letters, signature sheets, sign-in sheets, or notes from trusted adults (teachers, coordinators, supervisors).
- APPROVE screenshots of emails, confirmation messages, or thank-you notes from organizations.
- APPROVE certificates, badges, or any official acknowledgment of volunteer work.
- REJECT only if image is completely unrelated, or is a meme/AI-generated image.

Respond as JSON only: {"isValid": true, "reasoning": "short sentence", "suggestions": []}
Keep reasoning under 100 characters.`;
}

/**
 * Single-step verification: sends image + structured description to Gemini.
 * Gemini cross-checks each description field against the actual image content.
 */
export async function verifyImage(imageFile: File, activityDescription: string): Promise<ImageVerificationResult> {
  if (!GEMINI_API_KEY) {
    return {
      isValid: false,
      error: 'Gemini API key not configured. Set VITE_GEMINI_API_KEY in project/.env and restart.',
    };
  }

  try {
    const base64Image = await fileToBase64(imageFile);
    const base64Content = base64Image.split(',')[1];
    const mimeType = imageFile.type;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: buildPrompt(activityDescription) },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Content
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json',
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData?.error?.message || `Gemini API error: ${response.status}`;
      console.error('Gemini API error:', errorData);
      return { isValid: false, error: msg };
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      return { isValid: false, error: 'No response from Gemini. Please try again.' };
    }

    // Extract JSON from response — handle prefixed text, markdown fences, and truncation
    let result: { isValid: boolean; reasoning: string; suggestions?: string[] };
    const extracted = extractJSON(textResponse);
    if (extracted) {
      result = extracted;
    } else {
      console.warn('Could not extract JSON from Gemini response:', textResponse.substring(0, 300));
      return {
        isValid: false,
        error: 'Unable to process the verification response. Please try again.',
      };
    }

    const reasoning = result.reasoning || 'No explanation provided.';
    const suggestions = result.suggestions || [];

    if (result.isValid) {
      return {
        isValid: true,
        geminiAnalysis: reasoning,
        geminiReasoning: reasoning,
      };
    }

    return {
      isValid: false,
      error: reasoning,
      geminiAnalysis: reasoning,
      geminiReasoning: reasoning,
      suggestions,
    };
  } catch (error) {
    console.error('Image verification error:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Verification failed. Please try again.',
    };
  }
}

/**
 * Robustly extract the JSON result from a Gemini response that may contain
 * prefixed text ("Here is the JSON:"), markdown fences, or be truncated.
 */
function extractJSON(raw: string): { isValid: boolean; reasoning: string; suggestions?: string[] } | null {
  // 1. Try to find a JSON object anywhere in the string
  const jsonMatch = raw.match(/\{[\s\S]*?"isValid"[\s\S]*?\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // JSON was truncated — fall through to regex extraction
    }
  }

  // 2. Regex extraction for truncated/malformed JSON
  const validMatch = raw.match(/"isValid"\s*:\s*(true|false)/);
  const reasonMatch = raw.match(/"reasoning"\s*:\s*"((?:[^"\\]|\\.)*)/);
  if (validMatch) {
    return {
      isValid: validMatch[1] === 'true',
      reasoning: reasonMatch ? reasonMatch[1] : (validMatch[1] === 'true' ? 'Approved.' : 'Rejected.'),
      suggestions: [],
    };
  }

  return null;
}

/**
 * Convert File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a valid image file (JPG, PNG, or WebP)' };
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'Image file size must be less than 5MB' };
  }

  return { valid: true };
}
