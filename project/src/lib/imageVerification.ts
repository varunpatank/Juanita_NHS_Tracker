const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface ImageVerificationResult {
  isValid: boolean;
  error?: string;
  geminiAnalysis?: string;
  geminiReasoning?: string;
  suggestions?: string[];
}

/**
 * Build a verification prompt that checks the image against the description.
 * Moderately strict: must actually match, but allows legit proof types.
 */
function buildPrompt(description: string): string {
  return `You verify NHS volunteer hour photo submissions. Be moderately strict.

Student's description: "${description}"

Carefully compare the image to the description above.

APPROVE if the image clearly shows evidence matching the described activity:
- Photo of student volunteering or working at the described location/activity
- Sign-in sheet or attendance log that plausibly matches the described org/activity/date
- Official letter, certificate, or supervisor note referencing the described volunteer work
- Confirmation email or screenshot mentioning the described event or organization
- Signature or handwritten note confirming the volunteer work described

REJECT if:
- The image has NO plausible connection to the described activity (e.g. random selfie when describing food bank work, landscape photo, meme)
- The image is a cartoon, drawing, AI-generated image, or clearly unrelated stock photo
- Text visible in the image refers to a completely different organization or activity than described
- The student described one specific activity but the image clearly shows something entirely different
- The image is blank, completely blurry, or has no discernible relevant content

IMPORTANT: "When in doubt" is NOT a reason to approve. The image must have a real, direct connection to what was described.

Example: "Volunteered at Food Bank sorting food" + beach selfie = REJECT
Example: "Volunteered at Food Bank" + sign-in sheet from a food bank = APPROVE
Example: "Tutored students at Juanita HS" + signature from teacher at Juanita HS confirming tutoring = APPROVE
Example: "Helped at animal shelter" + random photo of a dog at home = REJECT (not at a shelter)

Respond ONLY as JSON: {"isValid": true/false, "reasoning": "clear explanation of why approved or rejected", "suggestions": []}`;
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
