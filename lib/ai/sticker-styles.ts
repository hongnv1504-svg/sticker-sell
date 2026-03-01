export type StickerStyleKey =
    | 'pixar3d'
    | 'anime_kawaii'
    | 'chibi_gamer'
    | 'watercolor_soft'
    | 'pop_art'
    | 'minimalist_line';

export interface StickerStyleConfig {
    key: StickerStyleKey;
    name: string;
    basePrompt: string;
    emotionPromptTemplate: string;
}

export const STICKER_STYLES: Record<StickerStyleKey, StickerStyleConfig> = {
    pixar3d: {
        key: 'pixar3d',
        name: 'Pixar 3D',
        basePrompt: `
Create a high-quality Pixar-style 3D character sticker based on the uploaded human photo.

RENDERING ENGINE & QUALITY:
- Pixar-inspired 3D stylized render (Unreal Engine 5 / Octane Render quality)
- Cinematic quality with soft global illumination
- Smooth subsurface scattering on skin for friendly cartoon finish
- High-resolution output suitable for Telegram and WhatsApp sticker packs

IDENTITY PRESERVATION (CRITICAL):
- Use uploaded image as main reference for face shape, bone structure, and key identity features
- Maintain strong facial likeness and recognizable traits
- Recreate hairstyle from uploaded image in clean Pixar-style 3D with smooth volume and stylized strands
- Preserve hair color, style, and silhouette from original photo

CHARACTER PROPORTIONS:
- Head-to-body ratio: 1:2.5 to 1:3 (cute chibi-like proportions optimized for sticker expressiveness)
- Large expressive eyes for high emotional readability
- Cute, friendly, expressive Pixar-style cartoon (avoid scary or creepy look)

WARDROBE & CLOTHING:
- Simple, neutral, brand-free outfit inspired by clothing in uploaded image
- Soft materials with minimal texture noise
- Clean, simple design optimized for small sticker readability
- No patterns, logos, or brand marks

BACKGROUND & LIGHTING:
- White background, sticker-ready cutout
- Soft studio lighting with even illumination
- No harsh shadows
- Clean anti-aliased edges

STRICT CONSTRAINTS:
- No logos, brand marks, watermarks, or text
- No background scenery or UI elements
- No horror style or creepy elements
- No realistic human skin texture (keep stylized cartoon finish)
- Single character only, centered composition
- No drastic age or gender changes
    `,
        emotionPromptTemplate: `
CONSISTENCY REQUIREMENTS:
- Same character identity, same outfit, same hairstyle
- Maintain all facial features and proportions from base character
- Change ONLY facial expression and pose according to the selected emotion

POSE & EXPRESSION GUIDELINES:
- 😂 Laughing: Head slightly tilted back, tightly closed smiling eyes, wide open laughing mouth, energetic comic body movement
- 🤣 Rolling Laugh: Leaning back dramatically, eyes squeezed shut, very wide open mouth, exaggerated laughing pose
- 🥰 Affectionate: Soft smile, glowing eyes, slight head tilt, hands gently close to chest
- 😍 Love-Struck: Big sparkling eyes, wide dreamy smile, forward-leaning excited posture
- 🤔 Thinking: Slight frown, eyes looking up or sideways, hand under chin, thoughtful head tilt
- 😉 Winking: One eye closed, playful smirk, confident relaxed posture
- 🥺 Pleading: Large glossy eyes, slightly raised inner eyebrows, small pout, hands close together near chest
- 😘 Blowing Kiss: Puckered lips, soft closed eyes or gentle wink, hand near mouth in kiss gesture
- 😢 Crying: Teary eyes, slightly downturned mouth, subtle slouched posture, emotional expression

FORBIDDEN ELEMENTS:
- No text, no emoji, no symbols, no speech bubbles
- No background changes
- No outfit changes
    `
    },

    anime_kawaii: {
        key: 'anime_kawaii',
        name: 'Anime Kawaii',
        basePrompt: `
Create a high-quality anime kawaii-style character sticker based on the uploaded human photo.

RENDERING ENGINE & QUALITY:
- High-quality 2.5D anime kawaii render with soft shading and pastel tones
- Clean anime linework with smooth cel shading
- Soft diffused lighting with gentle highlights
- High-resolution output suitable for Telegram and WhatsApp sticker packs

IDENTITY PRESERVATION (CRITICAL):
- Use uploaded image as identity reference
- Simplify facial structure into cute anime proportions while maintaining recognizable traits
- Recreate hairstyle in anime-style with simplified strands, soft volume, and pastel highlights
- Preserve hair color and style silhouette from original photo

CHARACTER PROPORTIONS:
- Head-to-body ratio: 1:2 to 1:2.5 (cute anime chibi-like proportions)
- Very large expressive anime eyes with sparkling highlights
- Cute, friendly, soft anime expressions with rounded facial features

WARDROBE & CLOTHING:
- Simple casual outfit inspired by clothing in uploaded image, adapted to anime kawaii fashion
- Soft fabric shading with pastel colors
- Minimal texture noise for sticker readability
- Clean inner clothing with simple colors
- No patterns, logos, or brand marks

BACKGROUND & LIGHTING:
- Plain white background, sticker-ready cutout
- Soft diffused lighting with gentle highlights
- No harsh shadows
- Clean smooth anti-aliasing

STRICT CONSTRAINTS:
- No logos, brand marks, watermarks, or text
- No background scenery or UI elements
- No horror or dark themes
- No realistic human skin texture (keep anime cel-shaded finish)
- Single character only, centered composition
    `,
        emotionPromptTemplate: `
CONSISTENCY REQUIREMENTS:
- Same character identity, same outfit, same hairstyle
- Maintain all facial features and anime proportions from base character
- Change ONLY facial expression and pose according to the selected emotion

POSE & EXPRESSION GUIDELINES:
- 😂 Laughing: Head slightly tilted back, tightly closed smiling eyes, wide open laughing mouth, energetic comic body movement
- 🤣 Rolling Laugh: Leaning back dramatically, eyes squeezed shut, very wide open mouth, exaggerated laughing pose
- 🥰 Affectionate: Soft smile, glowing eyes, slight head tilt, hands gently close to chest
- 😍 Love-Struck: Big sparkling eyes, wide dreamy smile, forward-leaning excited posture
- 🤔 Thinking: Slight frown, eyes looking up or sideways, hand under chin, thoughtful head tilt
- 😉 Winking: One eye closed, playful smirk, confident relaxed posture
- 🥺 Pleading: Large glossy eyes, slightly raised inner eyebrows, small pout, hands close together near chest
- 😘 Blowing Kiss: Puckered lips, soft closed eyes or gentle wink, hand near mouth in kiss gesture
- 😢 Crying: Teary eyes, slightly downturned mouth, subtle slouched posture, emotional expression

FORBIDDEN ELEMENTS:
- No text, no emoji, no symbols, no speech bubbles
- No background changes
- No outfit changes
    `
    },

    chibi_gamer: {
        key: 'chibi_gamer',
        name: 'Chibi Gamer',
        basePrompt: `
Create a high-quality chibi gamer-style 3D character sticker based on the uploaded human photo.

RENDERING ENGINE & QUALITY:
- Stylized 3D chibi gamer render with vibrant colors and game-like lighting
- Smooth stylized materials with low texture noise
- Soft studio lighting with slight game-like rim light
- High-resolution output suitable for Telegram and WhatsApp sticker packs

IDENTITY PRESERVATION (CRITICAL):
- Use uploaded image as reference
- Exaggerate head size and simplify facial features into chibi proportions while keeping likeness
- Recreate hairstyle with chunky stylized 3D hair, slightly exaggerated volume, and clean shapes
- Preserve hair color and style from original photo

CHARACTER PROPORTIONS:
- Head-to-body ratio: 1:2 to 1:2.2 (super chibi gamer proportions)
- Large playful cartoon eyes
- Playful, energetic, streamer-like exaggerated expressions

WARDROBE & CLOTHING:
- Casual gamer-style hoodie or jacket inspired by uploaded image
- Bright but balanced colors
- Smooth stylized materials with low texture noise
- Simple inner shirt with solid colors
- No logos, branding, patterns, or brand marks

BACKGROUND & LIGHTING:
- Plain white background, sticker-ready cutout
- Soft studio lighting with slight game-like rim light
- No harsh shadows
- Clean smooth anti-aliasing

STRICT CONSTRAINTS:
- No logos, brand marks, watermarks, or text
- No background scenery or UI elements
- No horror style
- No realistic human skin texture (keep stylized toon shading)
- Single character only, centered composition
    `,
        emotionPromptTemplate: `
CONSISTENCY REQUIREMENTS:
- Same character identity, same outfit, same hairstyle
- Maintain all facial features and chibi proportions from base character
- Change ONLY facial expression and pose according to the selected emotion

POSE & EXPRESSION GUIDELINES:
- 😂 Laughing: Head slightly tilted back, tightly closed smiling eyes, wide open laughing mouth, energetic comic body movement
- 🤣 Rolling Laugh: Leaning back dramatically, eyes squeezed shut, very wide open mouth, exaggerated laughing pose
- 🥰 Affectionate: Soft smile, glowing eyes, slight head tilt, hands gently close to chest
- 😍 Love-Struck: Big sparkling eyes, wide dreamy smile, forward-leaning excited posture
- 🤔 Thinking: Slight frown, eyes looking up or sideways, hand under chin, thoughtful head tilt
- 😉 Winking: One eye closed, playful smirk, confident relaxed posture
- 🥺 Pleading: Large glossy eyes, slightly raised inner eyebrows, small pout, hands close together near chest
- 😘 Blowing Kiss: Puckered lips, soft closed eyes or gentle wink, hand near mouth in kiss gesture
- 😢 Crying: Teary eyes, slightly downturned mouth, subtle slouched posture, emotional expression

FORBIDDEN ELEMENTS:
- No text, no emoji, no symbols, no speech bubbles
- No background changes
- No outfit changes
    `
    },

    watercolor_soft: {
        key: 'watercolor_soft',
        name: 'Watercolor Soft',
        basePrompt: `
Create a high-quality soft watercolor illustration character sticker based on the uploaded human photo.

RENDERING ENGINE & QUALITY:
- 2D watercolor illustration style with soft brush strokes and pastel washes
- Light watercolor texture with subtle pigment variation
- Soft even lighting with watercolor-style flat illumination
- High-resolution output suitable for Telegram and WhatsApp sticker packs

IDENTITY PRESERVATION (CRITICAL):
- Use uploaded image as reference
- Translate facial features into soft hand-painted watercolor style while maintaining likeness
- Recreate hairstyle with loose watercolor brush strokes, soft edges, and subtle color bleeding
- Preserve hair color and style from original photo

CHARACTER PROPORTIONS:
- Head-to-body ratio: 1:3 (soft illustration proportions)
- Medium-large soft expressive eyes
- Gentle, warm, emotional expressions with soft edges

WARDROBE & CLOTHING:
- Simple clothing inspired by uploaded image, painted in watercolor style
- Light watercolor texture with subtle pigment variation
- Soft edges with gentle color transitions
- Clean simple inner clothing in watercolor style
- No logos or brand marks

BACKGROUND & LIGHTING:
- White paper-like background, sticker-ready cutout
- Soft even lighting with watercolor-style flat illumination
- No harsh shadows
- Clean cut-out edges with soft watercolor boundaries

STRICT CONSTRAINTS:
- No logos, brand marks, watermarks, or text
- No background scenery or UI elements
- No dark or horror style
- No photorealistic rendering (keep watercolor illustration style)
- Single character only, centered composition
    `,
        emotionPromptTemplate: `
CONSISTENCY REQUIREMENTS:
- Same character identity, same outfit, same hairstyle
- Maintain all facial features and watercolor style from base character
- Change ONLY facial expression and pose according to the selected emotion

POSE & EXPRESSION GUIDELINES:
- 😂 Laughing: Head slightly tilted back, tightly closed smiling eyes, wide open laughing mouth, energetic comic body movement
- 🤣 Rolling Laugh: Leaning back dramatically, eyes squeezed shut, very wide open mouth, exaggerated laughing pose
- 🥰 Affectionate: Soft smile, glowing eyes, slight head tilt, hands gently close to chest
- 😍 Love-Struck: Big sparkling eyes, wide dreamy smile, forward-leaning excited posture
- 🤔 Thinking: Slight frown, eyes looking up or sideways, hand under chin, thoughtful head tilt
- 😉 Winking: One eye closed, playful smirk, confident relaxed posture
- 🥺 Pleading: Large glossy eyes, slightly raised inner eyebrows, small pout, hands close together near chest
- 😘 Blowing Kiss: Puckered lips, soft closed eyes or gentle wink, hand near mouth in kiss gesture
- 😢 Crying: Teary eyes, slightly downturned mouth, subtle slouched posture, emotional expression

FORBIDDEN ELEMENTS:
- No text, no emoji, no symbols, no speech bubbles
- No background changes
- No outfit changes
    `
    },

    pop_art: {
        key: 'pop_art',
        name: 'Pop Art',
        basePrompt: `
Create a high-quality pop art illustration character sticker based on the uploaded human photo.

RENDERING ENGINE & QUALITY:
- 2D pop art illustration with bold outlines, flat vibrant colors, comic-style shading and halftone dots
- High-contrast color blocks with subtle halftone texture
- Flat graphic lighting with high contrast
- High-resolution output suitable for Telegram and WhatsApp sticker packs

IDENTITY PRESERVATION (CRITICAL):
- Use uploaded image as reference
- Simplify facial shapes into bold pop-art forms while keeping likeness
- Recreate hairstyle with flat color hair, bold black outlines, and graphic shapes
- Preserve hair color and style from original photo

CHARACTER PROPORTIONS:
- Head-to-body ratio: 1:3 (graphic cartoon proportions)
- Bold stylized comic eyes
- Strong, exaggerated comic-style facial expressions

WARDROBE & CLOTHING:
- Simple clothing inspired by uploaded image, rendered in bold pop-art flat colors
- High-contrast color blocks with subtle halftone texture
- Flat-color inner clothing
- No logos, patterns, or brand marks

BACKGROUND & LIGHTING:
- Pure white background, sticker-ready cutout
- Flat graphic lighting with high contrast
- No realistic shadows
- Crisp vector-like edges with high contrast outlines

STRICT CONSTRAINTS:
- No logos, brand marks, watermarks, or text
- No background scenery or UI elements
- No realistic rendering (keep pop art graphic style)
- No horror style
- Single character only, centered composition
- No speech bubbles or typography
    `,
        emotionPromptTemplate: `
CONSISTENCY REQUIREMENTS:
- Same character identity, same outfit, same hairstyle
- Maintain all facial features and pop art style from base character
- Change ONLY facial expression and pose according to the selected emotion

POSE & EXPRESSION GUIDELINES:
- 😂 Laughing: Head slightly tilted back, tightly closed smiling eyes, wide open laughing mouth, energetic comic body movement
- 🤣 Rolling Laugh: Leaning back dramatically, eyes squeezed shut, very wide open mouth, exaggerated laughing pose
- 🥰 Affectionate: Soft smile, glowing eyes, slight head tilt, hands gently close to chest
- 😍 Love-Struck: Big sparkling eyes, wide dreamy smile, forward-leaning excited posture
- 🤔 Thinking: Slight frown, eyes looking up or sideways, hand under chin, thoughtful head tilt
- 😉 Winking: One eye closed, playful smirk, confident relaxed posture
- 🥺 Pleading: Large glossy eyes, slightly raised inner eyebrows, small pout, hands close together near chest
- 😘 Blowing Kiss: Puckered lips, soft closed eyes or gentle wink, hand near mouth in kiss gesture
- 😢 Crying: Teary eyes, slightly downturned mouth, subtle slouched posture, emotional expression

FORBIDDEN ELEMENTS:
- No text, no emoji, no symbols, no speech bubbles
- No background changes
- No outfit changes
    `
    },

    minimalist_line: {
        key: 'minimalist_line',
        name: 'Minimalist Line',
        basePrompt: `
Create a high-quality minimalist line art illustration character sticker based on the uploaded human photo.

RENDERING ENGINE & QUALITY:
- Minimalist 2D line art illustration with clean vector lines and limited color palette
- No texture, no shading, clean vector-style outlines only
- Flat neutral lighting with no shadows
- High-resolution output suitable for Telegram and WhatsApp sticker packs

IDENTITY PRESERVATION (CRITICAL):
- Use uploaded image as reference
- Reduce facial features into clean minimal line art while maintaining likeness
- Recreate hairstyle with simple clean line strokes for silhouette with minimal detail
- Preserve hair shape and style from original photo

CHARACTER PROPORTIONS:
- Head-to-body ratio: 1:3 (simple cartoon proportions)
- Simple minimal stylized eyes represented by dots or short lines
- Clear readable expressions using minimal lines and simple shapes

WARDROBE & CLOTHING:
- Simple clothing outline inspired by uploaded image, rendered in minimal line art style
- No texture, no shading, clean vector-style outlines only
- Minimal inner clothing linework
- No patterns, logos, or brand marks

BACKGROUND & LIGHTING:
- Pure white background, sticker-ready cutout
- Flat neutral lighting with no shadows
- Minimalist graphic style
- Crisp clean vector-like edges

STRICT CONSTRAINTS:
- No logos, brand marks, watermarks, or text
- No background scenery or UI elements
- No realistic shading or gradients
- No horror or dark themes
- Single character only, centered composition
- Flat white or light fill with clean black or dark gray outlines
    `,
        emotionPromptTemplate: `
CONSISTENCY REQUIREMENTS:
- Same character identity, same outfit, same hairstyle
- Maintain all facial features and minimalist line style from base character
- Change ONLY facial expression and pose according to the selected emotion

POSE & EXPRESSION GUIDELINES:
- 😂 Laughing: Head slightly tilted back, tightly closed smiling eyes, wide open laughing mouth, energetic comic body movement
- 🤣 Rolling Laugh: Leaning back dramatically, eyes squeezed shut, very wide open mouth, exaggerated laughing pose
- 🥰 Affectionate: Soft smile, glowing eyes, slight head tilt, hands gently close to chest
- 😍 Love-Struck: Big sparkling eyes, wide dreamy smile, forward-leaning excited posture
- 🤔 Thinking: Slight frown, eyes looking up or sideways, hand under chin, thoughtful head tilt
- 😉 Winking: One eye closed, playful smirk, confident relaxed posture
- 🥺 Pleading: Large glossy eyes, slightly raised inner eyebrows, small pout, hands close together near chest
- 😘 Blowing Kiss: Puckered lips, soft closed eyes or gentle wink, hand near mouth in kiss gesture
- 😢 Crying: Teary eyes, slightly downturned mouth, subtle slouched posture, emotional expression

FORBIDDEN ELEMENTS:
- No text, no emoji, no symbols, no speech bubbles
- No background changes
- No outfit changes
    `
    }
};
