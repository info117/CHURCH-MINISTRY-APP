/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Validates whether a given string is a valid 6-character hex code
 */
export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6})$/.test(hex);
}

/**
 * Converts a hex code to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!isValidHexColor(hex)) return null;
  const cleanHex = hex.replace('#', '');
  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16)
  };
}

/**
 * Adjusts color brightness (positive percent = lighten, negative percent = darken)
 */
export function adjustHexBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const amount = Math.round(2.55 * percent);
  const r = Math.min(255, Math.max(0, rgb.r + amount));
  const g = Math.min(255, Math.max(0, rgb.g + amount));
  const b = Math.min(255, Math.max(0, rgb.b + amount));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Applies custom brand primary color to root CSS variables dynamically
 */
export function applyChurchBrandTheme(hex: string): boolean {
  if (!isValidHexColor(hex)) return false;

  const root = document.documentElement;
  const rgb = hexToRgb(hex);
  if (!rgb) return false;

  const hoverColor = adjustHexBrightness(hex, -15);
  const lightColor = adjustHexBrightness(hex, 45);
  const glowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;

  // Update CSS custom properties
  root.style.setProperty('--church-primary', hex);
  root.style.setProperty('--golden-purple', hex);
  root.style.setProperty('--church-primary-hover', hoverColor);
  root.style.setProperty('--church-primary-light', lightColor);
  root.style.setProperty('--church-primary-glow', glowColor);

  // Persist preference to localStorage
  try {
    localStorage.setItem('church_custom_brand_color', hex);
  } catch (e) {
    console.warn('Could not persist theme to localStorage', e);
  }

  return true;
}

/**
 * Reads and applies saved theme from storage on app initialization
 */
export function initializeChurchBrandTheme(fallbackHex: string = '#7D3AC1'): string {
  try {
    const saved = localStorage.getItem('church_custom_brand_color');
    if (saved && isValidHexColor(saved)) {
      applyChurchBrandTheme(saved);
      return saved;
    }
  } catch (e) {
    console.warn('Failed reading church theme from storage', e);
  }

  applyChurchBrandTheme(fallbackHex);
  return fallbackHex;
}

/**
 * Extracts the dominant color hex from an uploaded image File using HTML5 canvas
 */
export async function extractHexFromImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve('#7D3AC1');
        }

        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);

        const imageData = ctx.getImageData(0, 0, 50, 50).data;
        let r = 0, g = 0, b = 0, count = 0;

        for (let i = 0; i < imageData.length; i += 4) {
          // Exclude near-white and near-black pixels to find the rich brand color
          const pr = imageData[i];
          const pg = imageData[i + 1];
          const pb = imageData[i + 2];
          const brightness = (pr + pg + pb) / 3;

          if (brightness > 35 && brightness < 235) {
            r += pr;
            g += pg;
            b += pb;
            count++;
          }
        }

        if (count === 0) {
          return resolve('#7D3AC1');
        }

        const avgR = Math.round(r / count);
        const avgG = Math.round(g / count);
        const avgB = Math.round(b / count);

        const hex = `#${((1 << 24) + (avgR << 16) + (avgG << 8) + avgB).toString(16).slice(1)}`;
        resolve(hex);
      };
      img.onerror = () => reject(new Error('Failed loading image'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed reading file'));
    reader.readAsDataURL(file);
  });
}
