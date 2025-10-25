/**
 * Validates Chilean RUT format
 * Format: 8 digits + dash + 1 character (digit or 'K')
 * Examples: 19831267-3, 20072653-7, 12345678-K
 */
export const validateRutFormat = (rut: string): boolean => {
  // Remove any whitespace
  const cleanRut = rut.trim();
  
  // Check if it matches the pattern: 8 digits + dash + 1 character
  const rutPattern = /^\d{8}-[\dK]$/i;
  
  return rutPattern.test(cleanRut);
};

/**
 * Formats RUT string by converting to uppercase
 */
export const formatRut = (rut: string): string => {
  return rut.trim().toUpperCase();
};

/**
 * Validates RUT with check digit verification (optional - more complete validation)
 */
export const validateRutWithCheckDigit = (rut: string): boolean => {
  if (!validateRutFormat(rut)) {
    return false;
  }

  const [rutNumber, checkDigit] = rut.split('-');
  const digits = rutNumber.split('').map(Number).reverse();
  
  let sum = 0;
  let multiplier = 2;
  
  for (const digit of digits) {
    sum += digit * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const calculatedCheckDigit = remainder < 2 ? remainder.toString() : 'K';
  
  return checkDigit.toUpperCase() === calculatedCheckDigit;
};