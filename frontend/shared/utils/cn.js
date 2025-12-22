/**
 * className Utility
 * Merge Tailwind classes with proper precedence
 * Handles conditional classes and removes duplicates
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names into a single string
 * Merges Tailwind classes intelligently
 * 
 * @param inputs - Class names to combine
 * @returns Merged class string
 * 
 * @example
 * cn('px-4 py-2', 'bg-blue-500', condition && 'hover:bg-blue-600')
 * // => 'px-4 py-2 bg-blue-500 hover:bg-blue-600'
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default cn;
