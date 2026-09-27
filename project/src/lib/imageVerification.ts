const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

type VerdictJSON = {
  isValid: boolean;
  reasoning: string;
  suggestions?: string[];
  imageDescription?: string;
  descriptionIsCoherent?: boolean;
  photoSupportsActivity?: boolean;
  photoMatchesPhotoClaim?: boolean;
};

export interface ImageVerificationResult {
  isValid: boolean;
  error?: string;
  /** true when the failure was a transport/parse problem, not a real rejection */
  retryable?: boolean;
  geminiAnalysis?: string;
  geminiReasoning?: string;
  suggestions?: string[];
}

export interface ActivityFields {
  organization?: string;
  activity?: string;
  serviceDate?: string;
  photoShows?: string;
  supervisor?: string;
  supervisorContact?: string;
}

/**
 * Build the verification prompt. The model is asked to describe what it can
 * actually see BEFORE judging - grounding the verdict in observed content is
 * what stops it from rubber-stamping whatever the student typed.
 */
function buildPrompt(description: string, fields?: ActivityFields): string {
  const claims = fields
    ? [
        fields.organization && `Organization: "${fields.organization}"`,
        fields.activity && `What they did: "${fields.activity}"`,
        fields.serviceDate && `Date of service: "${fields.serviceDate}"`,
        fields.photoShows && `What they say the photo shows: "${fields.photoShows}"`,
        fields.supervisor && `Supervisor: "${fields.supervisor}"`,
      ]
        .filter(Boolean)
        .join('\n')
    : description;

  return `You are verifying a National Honor Society volunteer-hours submission.
A student claims they volunteered and uploaded a photo as proof. Your job is to
check whether the photo actually supports the claim. Students receive graduation
credit for these hours, so a careless approval lets someone claim hours they did
not earn.

THE STUDENT'S CLAIMS:
${claims}

STEP 1 - Describe the image literally in ONE short sentence (20 words max).
What objects, people, setting, text or documents are actually visible? Do not
infer anything the pixels do not show.

STEP 2 - Judge the claims against what you described:

descriptionIsCoherent: false if the student's text is gibberish, keyboard mash,
placeholder text ("asdf", "test", "idk", "random"), nonsense, or does not
describe a real volunteering activity in intelligible language.

photoSupportsActivity: true only if what you SEE is consistent with the
described activity. A photo of a food bank supports "sorted food donations".
A selfie in a bedroom, a screenshot of a game, a meme, a pet, a random
landscape, or a picture of homework does NOT support a volunteering claim, no
matter what the student typed. This test applies to ACTION PHOTOS - documentary
proof is covered separately below and is always acceptable.

photoMatchesPhotoClaim: true only if the image matches what the student SAID the
photo would show. If they say "me handing out meals" and the image is a dog,
this is false.

DOCUMENTS ARE FIRST-CLASS PROOF. Many members prove hours on paper, not with
an action shot. If the image is any of these, treat photoSupportsActivity AND
photoMatchesPhotoClaim as TRUE:
- a handwritten or signed hour sheet, log, or timesheet
- a supervisor's signature, initials, or handwritten note
- an email, text message, or letter from a supervisor or organization
- a certificate, award, badge, or sign-in / sign-out sheet
- a volunteer ID, name tag, or confirmation screenshot

Approve these even when: the handwriting is messy or partly illegible, the photo
is cropped or low quality, the organization name is abbreviated or missing, only
a signature is visible, or it is a photo of a screen. A signature alone is
normal and sufficient - do not demand that a document name the organization or
spell out the activity.

If the image contains ANY handwriting, signature, printed or typed text, treat
it as documentary proof: set photoSupportsActivity AND photoMatchesPhotoClaim to
true unless the visible text clearly shows it is unrelated to volunteering. Do
not split hairs over wording - "signature", "signed sheet", "log", "note" and
"form" all describe the same kind of proof, so a signature satisfies a claim of
"signed log sheet" and vice versa.

Only reject a document if it plainly has nothing to do with volunteering -
for example a math worksheet, a receipt for a personal purchase, or a genuinely
blank page.

STEP 3 - isValid is true ONLY if descriptionIsCoherent AND photoSupportsActivity
AND photoMatchesPhotoClaim are all true. If you are unsure whether the photo
shows the claimed activity, isValid is false - being wrong in favour of the
student defeats the purpose of verification.

reasoning: one specific sentence naming what you saw and why it does or does not
match. Never generic. Bad: "The image matches." Good: "The photo shows a dog on
a sofa, which does not support sorting donations at a food bank."

suggestions: if rejecting, 1-3 short, concrete fixes.

Respond ONLY as JSON, with the verdict keys FIRST, exactly in this order:
{"isValid": true/false, "descriptionIsCoherent": true/false,
"photoSupportsActivity": true/false, "photoMatchesPhotoClaim": true/false,
"reasoning": "...", "imageDescription": "...", "suggestions": []}`;
}


/** Words that mean "my proof is paperwork, not an action shot". */
const DOCUMENT_WORDS = [
  'signature', 'signed', 'sign', 'sheet', 'log', 'logbook', 'timesheet',
  'note', 'letter', 'email', 'e-mail', 'text', 'message', 'certificate',
  'award', 'form', 'confirmation', 'receipt of service', 'sign-in', 'sign in',
  'signin', 'sign-out', 'initials', 'verification', 'proof of hours', 'slip',
];

function claimsDocumentProof(...parts: (string | undefined)[]): boolean {
  const hay = parts.filter(Boolean).join(' ').toLowerCase();
  return DOCUMENT_WORDS.some((w) => hay.includes(w));
}

/**
 * Second pass for paperwork. The main prompt judges whether a photo depicts an
 * activity, which is the wrong question for a signed hour sheet - so when the
 * student says their proof is a document and the first pass rejected it, ask a
 * narrower question instead: is this actually a document, and is there anything
 * showing it is unrelated to volunteering?
 */
async function verifyDocument(
  base64Content: string,
  mimeType: string,
  claims: string
): Promise<{ isDocument: boolean; unrelated: boolean; reasoning: string } | null> {
  const prompt = `A student submitted this image as proof of volunteer hours.
They describe it as paperwork rather than an action photo.

Their claims:
${claims}

Answer two narrow questions about what is VISIBLE in the image:

isDocument: true if the image contains ANY handwriting, a signature, initials,
printed or typed text, a ruled form, a certificate, a screenshot of a message or
email, or a sign-in sheet. Messy handwriting, partial crops, glare, low quality,
and photos-of-a-screen all still count as true.

clearlyUnrelated: true ONLY if you can read enough to tell the document has
nothing to do with volunteering - for example a graded math worksheet, a store
receipt, or a completely blank page. If you cannot read it well enough to be
sure, this is false.

Respond ONLY as JSON:
{"isDocument": true/false, "clearlyUnrelated": true/false, "reasoning": "one sentence"}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: base64Content } },
              ],
            },
          ],
          generationConfig: {
            temperature: 0,
            // gemini-2.5-flash spends part of the budget on hidden reasoning
            // tokens; without headroom the JSON gets cut off mid-object.
            maxOutputTokens: 4096,
            thinkingConfig: { thinkingBudget: 512 },
            responseMimeType: 'application/json',
          },
        }),
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const match = text.match(/\{[\s\S]*?"isDocument"[\s\S]*?\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    return {
      isDocument: parsed.isDocument === true,
      unrelated: parsed.clearlyUnrelated === true,
      reasoning: parsed.reasoning || '',
    };
  } catch (error) {
    console.error('Document second pass failed:', error);
    return null;
  }
}

/**
 * Single-step verification: sends image + structured description to Gemini.
 * Gemini cross-checks each description field against the actual image content.
 */
export async function verifyImage(
  imageFile: File,
  activityDescription: string,
  fields?: ActivityFields
): Promise<ImageVerificationResult> {
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
                { text: buildPrompt(activityDescription, fields) },
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
            temperature: 0,
            // gemini-2.5-flash spends part of the budget on hidden reasoning
            // tokens; without headroom the JSON gets cut off mid-object.
            maxOutputTokens: 4096,
            thinkingConfig: { thinkingBudget: 512 },
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
    const candidate = data.candidates?.[0];
    const finishReason = candidate?.finishReason;
    const textResponse = candidate?.content?.parts?.[0]?.text;

    if (!textResponse) {
      console.error('Gemini returned no text.', { finishReason, usage: data.usageMetadata });
      return {
        isValid: false,
        error:
          finishReason === 'SAFETY'
            ? 'That image was blocked by the safety filter. Try a different photo of your proof.'
            : 'The verifier did not respond. Please try again in a moment.',
      };
    }

    // Extract JSON from response — handle prefixed text, markdown fences, and truncation
    let result: VerdictJSON;
    const extracted = extractJSON(textResponse);
    if (extracted) {
      result = extracted;
    } else {
      console.warn('Could not parse verification response.', {
        finishReason,
        head: textResponse.substring(0, 300),
      });
      return {
        isValid: false,
        error:
          finishReason === 'MAX_TOKENS'
            ? 'The verifier ran out of room before finishing. Please press Verify again.'
            : 'The verifier sent back something unreadable. Please press Verify again - this usually works on a second try.',
        retryable: true,
      };
    }

    const reasoning = result.reasoning || 'No explanation provided.';
    const suggestions = result.suggestions || [];

    // Don't take isValid on trust - a model that says "isValid: true" while
    // also reporting the photo doesn't match has contradicted itself, and the
    // sub-answers are the grounded ones. Missing fields count as a failure.
    const passesRubric =
      result.descriptionIsCoherent !== false &&
      result.photoSupportsActivity === true &&
      result.photoMatchesPhotoClaim === true;

    // Paperwork gets a second, narrower look before being turned away.
    const wantsDocumentCheck = claimsDocumentProof(
      activityDescription,
      fields?.photoShows,
      fields?.activity
    );

    if ((!result.isValid || !passesRubric) && wantsDocumentCheck) {
      const doc = await verifyDocument(base64Content, mimeType, activityDescription);
      if (doc && doc.isDocument && !doc.unrelated) {
        const why = doc.reasoning || 'Accepted as documentary proof of service.';
        return { isValid: true, geminiAnalysis: why, geminiReasoning: why };
      }
    }

    if (result.isValid === true && !passesRubric) {
      console.warn('Verification overruled — model contradicted its own checks:', result);
      return {
        isValid: false,
        error:
          reasoning ||
          'The photo does not clearly show the activity you described. Please upload a photo taken at the activity.',
        geminiAnalysis: reasoning,
        geminiReasoning: reasoning,
        suggestions,
      };
    }

    if (result.isValid && passesRubric) {
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
function extractJSON(raw: string): VerdictJSON | null {
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

  // Truncated before "isValid" but after the sub-checks: the sub-checks are
  // the grounded answers, so a verdict can still be derived from them.
  if (!validMatch) {
    const sub = (key: string) =>
      raw.match(new RegExp('"' + key + '"\\s*:\\s*(true|false)'))?.[1];
    const coherent = sub('descriptionIsCoherent');
    const supports = sub('photoSupportsActivity');
    const matches = sub('photoMatchesPhotoClaim');
    if (coherent || supports || matches) {
      return {
        isValid: coherent === 'true' && supports === 'true' && matches === 'true',
        reasoning: reasonMatch ? reasonMatch[1] : 'Verified from partial response.',
        descriptionIsCoherent: coherent === 'true',
        photoSupportsActivity: supports === 'true',
        photoMatchesPhotoClaim: matches === 'true',
        suggestions: [],
      };
    }
  }

  if (validMatch) {
    const approved = validMatch[1] === 'true';
    const sub = (key: string) =>
      raw.match(new RegExp('"' + key + '"\\s*:\\s*(true|false)'))?.[1] === 'true';
    return {
      isValid: approved,
      reasoning: reasonMatch ? reasonMatch[1] : approved ? 'Approved.' : 'Rejected.',
      descriptionIsCoherent: sub('descriptionIsCoherent'),
      photoSupportsActivity: sub('photoSupportsActivity'),
      photoMatchesPhotoClaim: sub('photoMatchesPhotoClaim'),
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
  // HEIC/HEIF is what iPhones produce by default and Gemini accepts it.
  const validTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'image/heic', 'image/heif',
  ];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a photo (JPG, PNG, WebP, or HEIC)' };
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'Image file size must be less than 5MB' };
  }

  return { valid: true };
}
