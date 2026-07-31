# Tines

## Overview
Tines feels like a confident, modern automation platform with an editorial personality: spacious, friendly, and slightly whimsical. The visual tone is high-energy but controlled, balancing a bold lavender backdrop with crisp white type and playful accent colors. It is clearly designed for technical buyers and operations teams, but the presentation stays approachable and product-led rather than heavy or enterprise-stiff.

## Colors
- **Primary (#8D75E6):** The signature lavender background and primary brand field. It gives the interface its distinctive, memorable atmosphere and should dominate large surfaces.
- **Secondary (#FCF9F5):** A warm off-white used for primary buttons, panels, and light surfaces. It softens the palette and keeps content readable against the saturated purple stage.
- **Tertiary (#F47E3F):** A bright orange accent used sparingly for emphasis, icons, badges, and illustration moments. It adds warmth and contrast without competing with the main brand color.
- **Neutral (#D6EDD9):** A pale minty neutral that works well for supportive cards and product illustration areas. It introduces a softer, more playful tonal layer.
- **Surface (#FCF9F5):** The main card and panel surface color used across the UI to keep content light and airy.
- **On-surface (#1F7A57):** A deep green used for text and iconography on light surfaces for contrast and clarity.
- **Text (#FFFFFF):** Pure white text used across the hero, nav, and CTAs on the purple background. This is the default foreground color for high-contrast overlays.
- **Ink (#6956A8):** A muted purple used for button text and secondary foreground treatment on light surfaces. It keeps the palette cohesive even when elements invert.
- **Border (#87D1A3):** A soft green border tint seen in card styling. Use it for subtle separation rather than hard dividing lines.
- **Link (#3C699B):** A blue link color for tertiary actions and inline navigation cues. It provides a cooler utility accent distinct from the core brand violet.
- **Success (#1F7A57):** A deeper green used for confirmation states and positive information in product UI.
- **Error (#E24B4B):** Reserved for destructive or failure states; it should remain rare in this otherwise optimistic palette.

## Typography
Headlines use **Reckless**, a refined serif with generous curves and a premium editorial feel. The largest display styles are light in weight at 400 and rely on tight negative letter spacing to create a polished, cinematic landing-page hierarchy. Body and navigation text use **Roobert**, which feels geometric, contemporary, and highly legible at small sizes.

The system mixes strong serif headlines with clean sans-serif UI labels to create contrast between storytelling and product functionality. Labels and buttons are medium to semi-bold, while eyebrow text is compact, uppercase-friendly, and letter-spaced for status or section cues. Use the serif for narrative emphasis and the sans-serif for all navigation, controls, and dense interface copy.

## Layout & Spacing
The layout is centered and hero-led, with a wide desktop canvas and strong vertical stacking. Content is arranged in a fluid, responsive grid, but the composition prefers large breathing room over dense columns. The spacing rhythm uses small increments for UI details and much larger jumps for section separation, with `xs`/`sm` supporting internal gaps and `lg`/`xl` reserved for page-scale moments.

Buttons and nav items are tightly padded and compact, while the overall page relies on abundant negative space around the headline, hero CTA row, and partner logos. Cards and product mockups sit lower in the page and overlap the background in a layered, floating presentation.

## Elevation & Depth
The aesthetic is intentionally flat in terms of shadow. Depth comes from contrast, layering, borders, and overlapping components rather than elevation blur. White cards, outlined pills, and bordered panels create a clean modular hierarchy against the saturated purple background.

Product screenshots and illustrated objects feel stacked through proximity and framing, not through dramatic shadow systems. If depth is needed, prefer thin borders, slight tonal shifts, and overlap before introducing shadows.

## Shapes
The shape language is soft and friendly, with rounded corners on nearly every interactive element. Buttons use a small radius, while cards use a much more generous `xl` curve to feel approachable and tactile. Pills and chips are fully rounded, reinforcing the playful, modern SaaS tone.

Avoid sharp geometry unless you need a purely structural container. The overall feel should be gently pillowy rather than angular or rigid.

## Components
**Buttons:** Primary buttons use the light off-white surface with ink-colored text, matching `button-primary`. Secondary buttons are outlined/transparent on the purple background, matching `button-secondary`, and should remain high-contrast but understated. Padding is compact: 12px vertical and 14px horizontal, with a minimum button footprint around 91px by 39px. Button text should stay medium-bold and never feel oversized.

**Cards:** Cards are bright, lightly bordered, and rounded at `rounded.xl`. Keep backgrounds clean and avoid shadows; borders do the work. The `card` pattern should feel like a crisp UI panel, while `card-accent` can be used for softer supportive content blocks.

**Inputs:** Inputs should match the light-surface treatment with rounded corners and modest padding. Use clear borders or tonal separation rather than shadow. The form language should feel calm and efficient, not dense or heavily outlined.

**Pills, chips, and badges:** Use full rounding with small internal padding. These elements should read as status tags, feature markers, or logo-like labels. Keep them compact and visually lightweight, often with semi-transparent overlays on dark backgrounds.

**Navigation:** Top navigation is minimal, text-first, and balanced around a compact center pill. Treat nav items like medium-weight utility labels, with subtle hierarchy rather than heavy button styling.

**Illustrations and product mockups:** Illustrations can be colorful and whimsical, using the tertiary orange alongside soft pastel tones. Product frames should stay white, bordered, and rounded so the interface chrome remains consistent with the rest of the system.

## Do's and Don'ts
- Do keep the lavender background as the dominant brand canvas.
- Do use Reckless for major headlines and Roobert for all UI and body copy.
- Do preserve the flat, border-led depth system instead of adding heavy shadows.
- Do maintain generous whitespace around hero content and large media blocks.
- Do use the off-white button treatment for primary calls to action on dark backgrounds.
- Don't introduce harsh black surfaces or dark enterprise-style panels.
- Don't mix too many accent hues; keep orange and mint as supporting notes only.
- Don't square off cards or buttons—soft radii are part of the brand signature.
