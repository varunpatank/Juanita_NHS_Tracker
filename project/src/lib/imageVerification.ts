const GOOGLE_VISION_API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Debug: Check if API keys are loaded
console.log('Vision API Key loaded:', GOOGLE_VISION_API_KEY ? 'Yes' : 'No');
console.log('Gemini API Key loaded:', GEMINI_API_KEY ? 'Yes' : 'No');

export interface ImageVerificationResult {
  isValid: boolean;
  error?: string;
  labels?: string[];
  webDetection?: {
    foundOnline: boolean;
    matchingUrls?: string[];
  };
  geminiAnalysis?: string;
  geminiReasoning?: string;
}

/**
 * Verify image with Gemini to check if activity description matches the image
 */
async function verifyWithGemini(imageFile: File, activityDescription: string): Promise<{ isValid: boolean; error?: string; analysis?: string }> {
  try {
    const base64Image = await fileToBase64(imageFile);
    const base64Content = base64Image.split(',')[1];
    const mimeType = imageFile.type;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are verifying proof of volunteer work for a high school student. The student claims they did this activity:

"${activityDescription}"

Analyze the provided image and determine:

1. Does the image show any evidence of volunteer/community service activity?
2. Does the image content match or support the activity description provided by the student?
3. Does it look like genuine proof (e.g., showing the student volunteering, signatures/certificates, organization branding, volunteer setting, etc.)?
4. Is this a random/unrelated image, or does it actually support their claimed activity?

REJECT if:
- The image is completely unrelated to the activity described
- It's just a random selfie, landscape, or generic photo with no volunteer context
- There's no visible evidence connecting it to the claimed activity
- It looks like a stock photo or downloaded image

ACCEPT if:
- The image shows volunteer activities, settings, or events
- Contains signatures, certificates, or official documentation
- Shows the student at an organization or volunteer location
- Has volunteer-related elements (name tags, organization logos, group activities, etc.)
- The image reasonably supports the activity description (doesn't have to be perfect, but should be relevant)

Respond in JSON format:
{
  "isValid": true/false,
  "reasoning": "explain why the image does or doesn't support the claimed activity",
  "confidence": "high/medium/low"
}`
                },
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
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to verify with Gemini');
    }

    const data = await response.json();
    console.log('Gemini API response:', data);
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      console.error('No text response from Gemini');
      return { isValid: false, error: 'Unable to analyze image' };
    }

    console.log('Gemini text response:', textResponse);

    // Parse Gemini's response
    let geminiResult;
    try {
      const cleanedResponse = textResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      geminiResult = JSON.parse(cleanedResponse);
      console.log('Parsed Gemini result:', geminiResult);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', textResponse);
      console.error('Parse error:', parseError);
      // If we can't parse, fail the verification
      return { 
        isValid: false, 
        error: 'Unable to analyze image properly. Please try again with a clearer image.',
        analysis: textResponse.substring(0, 200) // Show first 200 chars for debugging
      };
    }

    // Be strict about the validation
    if (!geminiResult.isValid || geminiResult.confidence === 'low') {
      return {
        isValid: false,
        error: geminiResult.reasoning || 'Image does not match the activity description',
        analysis: geminiResult.reasoning
      };
    }

    return {
      isValid: true,
      analysis: geminiResult.reasoning
    };
  } catch (error) {
    console.error('Gemini verification error:', error);
    // If Gemini fails completely, fail the verification
    return {
      isValid: false,
      error: 'Unable to verify image. Please try again or contact an administrator.',
      analysis: 'Gemini API error'
    };
  }
}

/**
 * Verify an image using Google Vision API + Gemini
 * - Checks if image contains actual content (not blank)
 * - Performs reverse image search to check if it exists online
 * - Uses Gemini to verify the image matches the activity description
 */
export async function verifyImage(imageFile: File, activityDescription: string): Promise<ImageVerificationResult> {
  try {
    console.log('Starting image verification...');
    console.log('Image file:', imageFile.name, imageFile.type, imageFile.size);
    console.log('Using Vision API Key:', GOOGLE_VISION_API_KEY ? 'Key present' : 'Key missing!');
    
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    const base64Content = base64Image.split(',')[1]; // Remove data:image/xxx;base64, prefix
    console.log('Image converted to base64, length:', base64Content.length);

    // Call Google Vision API
    const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;
    console.log('Calling Vision API...');
    
    const response = await fetch(visionApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Content,
            },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'WEB_DETECTION', maxResults: 10 },
              { type: 'SAFE_SEARCH_DETECTION' }
            ],
          },
        ],
      }),
    });

    console.log('Vision API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Vision API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to verify image with Vision API');
    }

    const data = await response.json();
    const result = data.responses[0];

    // Check for errors
    if (result.error) {
      return {
        isValid: false,
        error: result.error.message,
      };
    }

    // Extract labels for content verification
    const labels = result.labelAnnotations?.map((label: any) => label.description) || [];
    
    // Check if image has meaningful content
    if (labels.length === 0) {
      return {
        isValid: false,
        error: 'Image appears to be blank or invalid',
      };
    }

    // Check web detection (reverse image search)
    const webDetection = result.webDetection;
    let foundOnline = false;
    let matchingUrls: string[] = [];

    if (webDetection) {
      // Check for full matches (exact duplicates found online)
      if (webDetection.fullMatchingImages && webDetection.fullMatchingImages.length > 0) {
        foundOnline = true;
        matchingUrls = webDetection.fullMatchingImages.map((img: any) => img.url);
      }
      
      // Also check partial matches with high confidence
      if (webDetection.pagesWithMatchingImages && webDetection.pagesWithMatchingImages.length > 0) {
        const highConfidenceMatches = webDetection.pagesWithMatchingImages.filter(
          (page: any) => page.score && page.score > 0.8
        );
        if (highConfidenceMatches.length > 0) {
          foundOnline = true;
          matchingUrls = [...matchingUrls, ...highConfidenceMatches.map((page: any) => page.url)];
        }
      }
    }

    // Check safe search (optional - to detect inappropriate content)
    const safeSearch = result.safeSearchAnnotation;
    if (safeSearch) {
      const isUnsafe = ['adult', 'violence', 'racy'].some(
        category => safeSearch[category] === 'VERY_LIKELY' || safeSearch[category] === 'LIKELY'
      );
      if (isUnsafe) {
        return {
          isValid: false,
          error: 'Image content is inappropriate',
        };
      }
    }

    // If image found online, reject it
    if (foundOnline) {
      return {
        isValid: false,
        error: 'This image was found online. Please upload an original photo.',
        labels,
        webDetection: {
          foundOnline,
          matchingUrls: matchingUrls.slice(0, 3),
        },
      };
    }

    // Now verify with Gemini that the image matches the activity description
    console.log('Starting Gemini verification...');
    const geminiCheck = await verifyWithGemini(imageFile, activityDescription);
    console.log('Gemini verification result:', geminiCheck);
    
    // Strict verification - must pass Gemini check
    if (!geminiCheck.isValid) {
      return {
        isValid: false,
        error: geminiCheck.error || 'Image does not match your activity description',
        labels,
        webDetection: {
          foundOnline: false,
          matchingUrls: [],
        },
        geminiAnalysis: geminiCheck.analysis,
        geminiReasoning: geminiCheck.error
      };
    }

    return {
      isValid: true,
      labels,
      webDetection: {
        foundOnline: false,
        matchingUrls: [],
      },
      geminiAnalysis: geminiCheck.analysis,
      geminiReasoning: geminiCheck.analysis
    };
  } catch (error) {
    console.error('Image verification error:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to verify image',
    };
  }
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
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPG, PNG, or WebP)',
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image file size must be less than 5MB',
    };
  }

  return { valid: true };
}
