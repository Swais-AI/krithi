// Common validation helpers used across admin forms

/**
 * Name: letters, spaces, dots, hyphens, apostrophes. Min 2 chars.
 */
export const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  if (trimmed.length > 100) return false;
  return /^[\p{L}\s.'-]+$/u.test(trimmed);
};

/**
 * Indian mobile: exactly 10 digits, first digit 6-9.
 * Accepts +91XXXXXXXXXX and 0XXXXXXXXXX (strips prefix).
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
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
 * Email: basic RFC-ish pattern.
 * NOTE: For student_email and guardian_email, use isGmailEmail instead —
 * the DB has a CHECK constraint requiring @gmail.com for those columns.
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

/**
 * Gmail-only check — matches the DB constraints:
 *   chk_student_email  : student_email  IS NULL OR student_email  LIKE '%@gmail.com'
 *   chk_guardian_email : guardian_email IS NULL OR guardian_email LIKE '%@gmail.com'
 *
 * Returns true if the value is empty (nullable columns) or ends with @gmail.com.
 */
export const isGmailEmail = (email) => {
  if (!email || !String(email).trim()) return true; // null is OK
  return /^[^\s@]+@gmail\.com$/i.test(String(email).trim());
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