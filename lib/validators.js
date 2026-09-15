// Common validation helpers used across admin forms

/**
 * Name: letters, spaces, dots, hyphens, apostrophes. Min 2 chars.
 * Rejects numbers and other symbols.
 */
export const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  if (trimmed.length > 100) return false;
  // Allow unicode letters (\p{L}), spaces, dot, hyphen, apostrophe
  return /^[\p{L}\s.'-]+$/u.test(trimmed);
};

/**
 * Indian mobile: exactly 10 digits, first digit 6-9.
 * Also accepts +91XXXXXXXXXX and 0XXXXXXXXXX (strips prefix).
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  // Accept 10-digit, or 12-digit with 91 prefix, or 11-digit with 0 prefix
  const normalized =
    digits.length === 12 && digits.startsWith('91')
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith('0')
      ? digits.slice(1)
      : digits;
  if (normalized.length !== 10) return false;
  return /^[6-9]\d{9}$/.test(normalized);
};

/**
 * Email: basic RFC-ish pattern; we mainly enforce user@domain.tld
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

/**
 * Normalize phone to 10-digit string for storage
 */
export const normalizePhone = (phone) => {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  const normalized =
    digits.length === 12 && digits.startsWith('91')
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith('0')
      ? digits.slice(1)
      : digits;
  return normalized.length === 10 ? normalized : null;
};
