/**
 * Prompt templates for the real image-to-image grooming generator.
 *
 * Design goals (per product spec):
 *  - The INPUT photo is the ground truth. The model edits it — it does not
 *    generate "a similar dog" from scratch.
 *  - Preserve: breed, coat color/pattern, markings, face, eyes, nose, ears,
 *    body proportions, pose, and (best-effort) background.
 *  - Change: coat length/volume, haircut shape, styling around the face,
 *    ears and paws — i.e. exactly what a real groomer would change.
 *  - Output must read as a real photograph, never illustration/CGI/anime.
 *
 * Written in English because the target image-editing models (Gemini
 * image-editing family, and image-editing models in general) follow
 * detailed English instructions more reliably than Polish, even though
 * the rest of the product is Polish-language.
 *
 * Kept deliberately separate from the API client (gemini.ts) so swapping
 * the underlying model/provider later does not require touching prompt
 * copy, and vice versa.
 */

export type StyleId =
  | 'teddy'
  | 'puppy-cut'
  | 'fluffy'
  | 'clean'
  | 'asian-fusion'
  | 'short';

const IDENTITY_PRESERVATION_PREFIX = `You are editing a real photograph of a real pet dog for a dog-grooming preview app. \
The attached image shows the customer's own dog. Treat it as a photo EDIT, not a new generation: \
the output must clearly be the SAME INDIVIDUAL DOG from the same photo, only after a grooming session.

Preserve exactly, without altering:
- breed and body type
- coat color, pattern, and markings (including any patches or unique spots)
- face shape, muzzle shape, eye color and shape, nose color and shape, ear shape and set
- body proportions, pose, and camera angle
- the background and lighting of the original photo (keep them as close to the original as possible)

Change only what a professional groomer would change during a grooming session:`;

const NEGATIVE_CONSTRAINTS_SUFFIX = `
Do not change the dog's breed. Do not change the dog's coat color or markings. Do not change the dog's \
facial identity, eye color, or eye shape. Do not add or remove body parts. Do not turn this into a \
different dog. Do not depict a different animal. Do not stylize the output as an illustration, painting, \
anime, cartoon, sticker, or CGI/3D render. Do not add text, watermarks, or logos. The output MUST be a \
single photorealistic photograph indistinguishable in style from the input photo, showing only the result \
of a haircut/grooming change.`;

const STYLE_INSTRUCTIONS: Record<StyleId, string> = {
  teddy: `Give the dog a natural, rounded "teddy bear" groom: trim the coat to an even, soft, medium-short \
length all over the body, and round off the head and muzzle area so the face reads as a soft, plush, \
rounded shape (fuller cheeks, rounded ears outline) — while keeping the dog's actual facial features and \
proportions recognizable. The finish should look neat but still soft and fluffy, never shaved or severe.`,

  'puppy-cut': `Give the dog a youthful "puppy cut": trim the coat to a short-to-medium, uniform length over \
the entire body, face, and legs, with soft, natural-looking edges and no dramatic shaping. The overall \
effect should look light, tidy, and low-maintenance, similar to how a young puppy's coat naturally looks.`,

  fluffy: `Significantly increase the visual volume and length of the dog's coat, making it noticeably \
longer, thicker, and airier all over the body, especially around the neck, chest, and tail, while doing \
only light, minimal trimming around the eyes and paws for hygiene. The coat should look soft, voluminous, \
and well-brushed — maximum natural fluffiness while still looking like real fur, not a wig or CGI fur \
shader.`,

  clean: `Give the dog a tidy, low-maintenance "clean" groom: trim the coat noticeably shorter and neaten it \
into crisp, even lines, especially around the muzzle, ears, and paws. The result should look sharp, \
practical, and well-groomed with minimal fluff, like a dog freshly clipped for easy upkeep.`,

  'asian-fusion': `Apply an "Asian Fusion" style groom: shape the head into a distinctly round, fuller \
silhouette with pronounced rounded contours around the face and ears, and add extra volume and definition \
to the coat on the body and legs in a stylized, salon-quality way. The look should be eye-catching and \
carefully sculpted, similar to award-show grooming, while the result must still read as a real, \
photographed dog rather than an illustration.`,

  short: `Give the dog a distinctly short haircut over the entire body: clip the coat noticeably shorter \
than in the original photo, close to the skin on the body while keeping it safe and natural-looking (not \
bald or patchy), for a practical, low-maintenance summer-ready look. Keep facial features and proportions \
natural.`,
};

export function buildGroomingPrompt(styleId: StyleId): string {
  const styleInstruction = STYLE_INSTRUCTIONS[styleId];
  return `${IDENTITY_PRESERVATION_PREFIX}\n${styleInstruction}\n${NEGATIVE_CONSTRAINTS_SUFFIX}`;
}

export function isValidStyleId(value: string): value is StyleId {
  return Object.prototype.hasOwnProperty.call(STYLE_INSTRUCTIONS, value);
}

export const ALL_STYLE_IDS = Object.keys(STYLE_INSTRUCTIONS) as StyleId[];
