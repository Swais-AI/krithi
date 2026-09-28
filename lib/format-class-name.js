// Display-format class names for the UI.
// Handles the common DB shapes: "1", "2", ..., "12", "8th Grade", "10", etc.
// Anything that isn't clean numeric 1-12 is returned as-is so we don't hide data.

export function formatClassName(raw) {
  if (raw === null || raw === undefined) return '';
  const str = String(raw).trim();
  if (!str) return '';

  // If already formatted like "8th Grade" or "10th Grade", keep as-is
  if (/^\d{1,2}(st|nd|rd|th)\s+grade$/i.test(str)) return str;

  // If purely numeric 1-12, format it
  if (/^\d{1,2}$/.test(str)) {
    const n = parseInt(str, 10);
    if (n >= 1 && n <= 12) {
      const suffix =
        n === 1 ? 'st' :
        n === 2 ? 'nd' :
        n === 3 ? 'rd' :
        'th';
      return `${n}${suffix} Grade`;
    }
  }

  // Otherwise return unchanged (e.g., "8-", "TEST_10th Grade", custom values)
  return str;
}

// Utility: sort helper for class names — numeric grades first, then alpha
export function compareClassNames(a, b) {
  const na = parseInt(String(a).match(/^\d+/)?.[0] || '', 10);
  const nb = parseInt(String(b).match(/^\d+/)?.[0] || '', 10);
  if (!isNaN(na) && !isNaN(nb)) return na - nb;
  if (!isNaN(na)) return -1;
  if (!isNaN(nb)) return 1;
  return String(a).localeCompare(String(b));
}