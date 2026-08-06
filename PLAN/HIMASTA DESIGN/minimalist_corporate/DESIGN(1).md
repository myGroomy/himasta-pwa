---
name: Minimalist Corporate
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#444651'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#4b1c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#6e2c00'
  on-tertiary-container: '#f39461'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#773205'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-mobile: 1rem
  gutter: 1rem
  touch-target-min: 48px
  container-max: 1200px
---

## Brand & Style
The design system is defined by a "Minimalist Corporate" aesthetic that prioritizes clarity, efficiency, and professional rigor. It targets enterprise environments and productivity tools where information density must be balanced with visual breathing room.

The style leverages a high-contrast, low-saturation palette to ensure maximum legibility and focus. By stripping away decorative shadows and gradients, the UI relies on structural integrity—using precise 1px borders and purposeful white space to create hierarchy. The emotional response is one of stability, reliability, and precision.

## Colors
The palette is rooted in a "Corporate Navy Blue" primary, used exclusively for interactive elements and active states. The neutral scale is cool-toned to maintain a clean, clinical feel.

- **Primary:** Use `#1E3A8A` for primary actions, links, and selection indicators.
- **Surface:** The main background is `#F8FAFC`, while all elevated containers (cards, modals) use `#FFFFFF`.
- **Borders:** A consistent `#E2E8F0` is used for all structural containment.
- **Semantic:** High-legibility pairings for feedback states. Backgrounds are desaturated and lightened to ensure black or high-contrast text remains the primary focus.

## Typography
Outfit is utilized for its geometric clarity and modern professional feel. The type system employs a rigorous scale to maintain order in data-heavy views.

- **Headlines:** Use Bold (700) or SemiBold (600) weights with slight negative letter spacing for a compact, authoritative look.
- **Body:** Standardized at 16px for readability, using 14px for secondary metadata or densified lists.
- **Labels:** Use uppercase for small UI labels (e.g., table headers, category tags) to differentiate from flow text.

## Layout & Spacing
This design system follows a mobile-first Progressive Web App (PWA) philosophy. The layout logic is a fluid grid that transitions into a centered fixed column on larger screens.

- **Mobile:** 16px (1rem) side margins are mandatory. Vertical rhythm should follow an 8px baseline.
- **Interactive Zones:** All buttons and inputs must maintain a minimum height/width of 48px to satisfy touch-target requirements.
- **Reflow:** On tablet and desktop, cards should span a 12-column grid. Gutters remain fixed at 16px to maintain high information density without clutter.

## Elevation & Depth
Depth is expressed through **Low-contrast outlines** rather than shadows. This minimizes visual noise and emphasizes the "Flat" corporate aesthetic.

- **Surfaces:** Use 1px solid borders (`#E2E8F0`) to define cards and sections. 
- **Active State:** On hover or focus, increase border weight or change border color to the primary navy blue.
- **Stacking:** Modals and dropdowns may use a very subtle, large-radius ambient shadow (0px 10px 15px -3px rgba(0,0,0,0.05)) to separate from the background, but the 1px border remains the primary anchor.

## Shapes
The shape language is "Rounded," striking a balance between approachable and professional. 

- **Standard Elements:** Buttons, input fields, and small chips use `rounded-md` (0.5rem).
- **Containers:** Large cards, section wrappers, and modals use `rounded-lg` (1rem).
- **Icons:** Use Lucide React style icons with a consistent 2px stroke width and rounded caps to match the UI radius.

## Components
- **Buttons:** Primary buttons are solid `#1E3A8A` with white text. Secondary buttons use a 1px border of `#E2E8F0` with Primary Blue text. Minimum height: 48px.
- **Inputs:** 1px border of `#E2E8F0`, 12px horizontal padding. Labels sit above the input in `label-caps` style.
- **Cards:** White background, 1px border, 16px to 24px internal padding depending on content density. No shadows.
- **Chips/Tags:** Use the semantic background colors with a matching text color for status indicators. Use `rounded-full` (pill shape) for tags to distinguish them from buttons.
- **Lists:** Separated by 1px horizontal dividers. Each row must have a minimum height of 56px for touch accessibility.
- **Icons:** Set to 20px or 24px depending on context, always with a 2px stroke weight.