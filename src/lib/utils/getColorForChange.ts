export function getColorForCustomRange(value: number, min: number, midpoint: number, max: number): string {
  // Clamp values to the custom range
  const clamped = Math.max(min, Math.min(max, value));
  
  let hue: number;
  
  if (clamped <= midpoint) {
    // Red (0°) to Yellow (60°) - from min to midpoint
    const percent = (clamped - min) / (midpoint - min); // [0 to 1]
    hue = percent * 60; // hue from 0 to 60
  } else {
    // Yellow (60°) to Green (120°) - from midpoint to max
    const percent = (clamped - midpoint) / (max - midpoint); // [0 to 1]
    hue = 60 + percent * 60; // hue from 60 to 120
  }
  
  return `hsl(${hue}, 80%, 75%)`;
}

export function getColorForCustomRangeInverted(value: number, min: number, midpoint: number, max: number): string {
  // Clamp values to the custom range
  const clamped = Math.max(min, Math.min(max, value));
  
  let hue: number;
  
  if (clamped <= midpoint) {
    // Green (120°) to Yellow (60°) - from min to midpoint
    const percent = (clamped - min) / (midpoint - min); // [0 to 1]
    hue = 120 - percent * 60; // hue from 120 to 60
  } else {
    // Yellow (60°) to Red (0°) - from midpoint to max
    const percent = (clamped - midpoint) / (max - midpoint); // [0 to 1]
    hue = 60 - percent * 60; // hue from 60 to 0
  }
  
  return `hsl(${hue}, 80%, 75%)`;
} 