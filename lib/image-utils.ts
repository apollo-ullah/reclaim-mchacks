/**
 * Shared Image Utilities
 * Common functions for image processing
 */

/**
 * Convert integer color to RGBA components
 */
export function intToRGBA(color: number): { r: number; g: number; b: number; a: number } {
  return {
    r: (color >> 24) & 0xff,
    g: (color >> 16) & 0xff,
    b: (color >> 8) & 0xff,
    a: color & 0xff,
  };
}

/**
 * Convert RGBA components to integer color
 * Uses >>> 0 to ensure unsigned 32-bit integer (prevents negative values)
 */
export function rgbaToInt(r: number, g: number, b: number, a: number): number {
  return (((r & 0xff) << 24) | ((g & 0xff) << 16) | ((b & 0xff) << 8) | (a & 0xff)) >>> 0;
}
