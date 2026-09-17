/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#14202C',
    tint: '#B8603E',

    // Core surfaces
    background: '#F6F1E8',
    foreground: '#14202C',

    // Cards / elevated surfaces
    card: '#FBF8F2',
    cardForeground: '#14202C',

    // Primary action color (buttons, links, active states)
    primary: '#17324D',
    primaryForeground: '#F6F1E8',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E7DED0',
    secondaryForeground: '#17324D',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#EDE7DD',
    mutedForeground: '#746F68',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#B8603E',
    accentForeground: '#FBF8F2',

    // Destructive actions (delete, error states)
    destructive: '#A94335',
    destructiveForeground: '#FBF8F2',

    // Borders and input outlines
    border: '#DED3C3',
    input: '#CEC0AE',
  },

  dark: {
    text: '#F6F1E8',
    tint: '#D98A63',
    background: '#14202C',
    foreground: '#F6F1E8',
    card: '#1D2E3D',
    cardForeground: '#F6F1E8',
    primary: '#E2B27A',
    primaryForeground: '#14202C',
    secondary: '#2A3A47',
    secondaryForeground: '#F6F1E8',
    muted: '#243541',
    mutedForeground: '#B6ADA2',
    accent: '#D98A63',
    accentForeground: '#14202C',
    destructive: '#E37A68',
    destructiveForeground: '#14202C',
    border: '#3A4B57',
    input: '#52606A',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
