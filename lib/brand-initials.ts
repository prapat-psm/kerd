// อักษรย่อของแบรนด์ ใช้แทนโลโก้จริง (branding.md: ไม่ใช้โลโก้แบรนด์อื่นโดยไม่ได้รับอนุญาต)
const GENERIC = new Set(["the", "thailand", "bank", "restaurants"]);
const THAI_LEADING_VOWEL = /^[เแโใไ]/;

function firstChar(word: string): string {
  return word.replace(THAI_LEADING_VOWEL, "").charAt(0).toUpperCase();
}

export function brandInitials(name: string): string {
  const acronym = name.match(/\(([A-Z0-9&]{2,4})\)/);
  if (acronym) return acronym[1];

  const words = name
    .replace(/\(.*?\)/g, " ")
    .split(/[\s/]+/)
    .filter((w) => w && !GENERIC.has(w.toLowerCase()));

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].length <= 3 ? words[0].toUpperCase() : firstChar(words[0]);
  return firstChar(words[0]) + firstChar(words[1]);
}
