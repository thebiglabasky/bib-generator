// Tracks which fonts have been loaded to avoid duplicates
const loadedFonts = new Set<string>();

export interface FontDefinition {
  name: string;
  family: string;
  googleFont: string | null;
}

export const AVAILABLE_FONTS: FontDefinition[] = [
  { name: 'Arial', family: 'Arial, sans-serif', googleFont: null },
  { name: 'Helvetica', family: 'Helvetica, sans-serif', googleFont: null },
  { name: 'Roboto', family: '"Roboto", sans-serif', googleFont: 'Roboto:wght@400;700' },
  { name: 'Open Sans', family: '"Open Sans", sans-serif', googleFont: 'Open+Sans:wght@400;700' },
  { name: 'Lato', family: '"Lato", sans-serif', googleFont: 'Lato:wght@400;700' },
  { name: 'Montserrat', family: '"Montserrat", sans-serif', googleFont: 'Montserrat:wght@400;700' },
  { name: 'Nunito', family: '"Nunito", sans-serif', googleFont: 'Nunito:wght@400;700' },
  { name: 'Poppins', family: '"Poppins", sans-serif', googleFont: 'Poppins:wght@400;700' },
  { name: 'Inter', family: '"Inter", sans-serif', googleFont: 'Inter:wght@400;700' },
  { name: 'Times New Roman', family: '"Times New Roman", serif', googleFont: null },
  { name: 'Georgia', family: 'Georgia, serif', googleFont: null },
  { name: 'Merriweather', family: '"Merriweather", serif', googleFont: 'Merriweather:wght@400;700' },
  { name: 'Playfair Display', family: '"Playfair Display", serif', googleFont: 'Playfair+Display:wght@400;700' },
  { name: 'Oswald', family: '"Oswald", sans-serif', googleFont: 'Oswald:wght@400;700' },
  { name: 'Bebas Neue', family: '"Bebas Neue", sans-serif', googleFont: 'Bebas+Neue:wght@400' },
];

/**
 * Load a Google Font dynamically by adding a link element to the document head
 * @param fontFamily - The font family CSS string (e.g., '"Roboto", sans-serif')
 * @returns Promise that resolves when the font is loaded and ready to use
 */
export async function loadFont(fontFamily: string | undefined): Promise<void> {
  if (!fontFamily) return;

  // Find the font definition
  const fontDef = AVAILABLE_FONTS.find(f => f.family === fontFamily);

  // System fonts - immediately available
  if (!fontDef || !fontDef.googleFont) {
    return;
  }

  // Already loaded
  if (loadedFonts.has(fontDef.googleFont)) {
    return;
  }

  // Mark as loading to prevent duplicates
  loadedFonts.add(fontDef.googleFont);

  // Create and append the link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontDef.googleFont}&display=swap`;
  document.head.appendChild(link);

  // Extract font name (e.g., "Roboto" from '"Roboto", sans-serif')
  const fontName = fontFamily.match(/["']([^"']+)["']/)?.[1] || fontFamily.split(',')[0].trim();

  // Wait for the font to actually load using the Font Loading API
  try {
    // Try loading common weights - 400 and 700
    await Promise.all([
      document.fonts.load(`400 12px "${fontName}"`),
      document.fonts.load(`700 12px "${fontName}"`)
    ]);
  } catch (e) {
    // If Font Loading API fails, fall back to a simple timeout
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * Load multiple fonts at once
 * @param fontFamilies - Array of font family CSS strings
 * @returns Promise that resolves when all fonts are loaded
 */
export async function loadFonts(fontFamilies: (string | undefined)[]): Promise<void> {
  await Promise.all(fontFamilies.map(loadFont));
}

/**
 * Extract unique font families from a list of elements
 * @param elements - Template elements
 * @returns Array of unique font families used by text elements
 */
export function extractFontFamilies(elements: any[]): string[] {
  const families = new Set<string>();

  elements.forEach(element => {
    if (element.type === 'text' && element.fontFamily) {
      families.add(element.fontFamily);
    }
  });

  return Array.from(families);
}

