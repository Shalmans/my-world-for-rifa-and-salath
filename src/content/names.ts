/**
 * ============================================================
 *  HER NAME, IN EVERY LANGUAGE
 *  35 unique renderings of "Rifa". First one is always Latin.
 *  `rtl: true` marks right-to-left scripts.
 * ============================================================
 */

export type NameVariant = {
  value: string;
  label: string;
  lang: string;
  rtl?: boolean;
};

export const nameShowcaseHeading = "Your name, in every language ♥";

export const nameVariants: NameVariant[] = [
  { value: "Rifa", label: "Latin", lang: "en" },
  { value: "रिफ़ा", label: "Hindi · Devanagari", lang: "hi" },
  { value: "ரிஃபா", label: "Tamil", lang: "ta" },
  { value: "రిఫా", label: "Telugu", lang: "te" },
  { value: "ರಿಫಾ", label: "Kannada", lang: "kn" },
  { value: "റിഫ", label: "Malayalam", lang: "ml" },
  { value: "রিফা", label: "Bengali", lang: "bn" },
  { value: "રિફા", label: "Gujarati", lang: "gu" },
  { value: "ਰਿਫ਼ਾ", label: "Punjabi · Gurmukhi", lang: "pa" },
  { value: "ریفا", label: "Persian", lang: "fa", rtl: true },
  { value: "ريفا", label: "Arabic", lang: "ar", rtl: true },
  { value: "رِفا", label: "Urdu", lang: "ur", rtl: true },
  { value: "රිෆා", label: "Sinhala", lang: "si" },
  { value: "ରିଫା", label: "Odia", lang: "or" },
  { value: "莉法", label: "Chinese", lang: "zh" },
  { value: "リファ", label: "Japanese · Katakana", lang: "ja" },
  { value: "리파", label: "Korean · Hangul", lang: "ko" },
  { value: "ริฟา", label: "Thai", lang: "th" },
  { value: "ရီဖာ", label: "Burmese", lang: "my" },
  { value: "រីហ្វា", label: "Khmer", lang: "km" },
  { value: "ຣິຟາ", label: "Lao", lang: "lo" },
  { value: "Рифа", label: "Russian · Cyrillic", lang: "ru" },
  { value: "Ріфа", label: "Ukrainian", lang: "uk" },
  { value: "Ρίφα", label: "Greek", lang: "el" },
  { value: "Ռիֆա", label: "Armenian", lang: "hy" },
  { value: "რიფა", label: "Georgian", lang: "ka" },
  { value: "ריפה", label: "Hebrew", lang: "he", rtl: true },
  { value: "ሪፋ", label: "Amharic · Ethiopic", lang: "am" },
  { value: "رىفا", label: "Uyghur", lang: "ug", rtl: true },
  { value: "ڕیفا", label: "Kurdish · Sorani", lang: "ckb", rtl: true },
  { value: "རི་ཕ", label: "Tibetan", lang: "bo" },
  { value: "⠠⠗⠊⠋⠁", label: "Braille", lang: "en" },
  { value: "⠗⠊⠋⠁", label: "Braille · lowercase", lang: "en" },
  {
    value: "⠗ ⠊ ⠋ ⠁",
    label: "Braille · spaced",
    lang: "en",
  },
  {
    value: "⠠⠗ ⠊ ⠋ ⠁",
    label: "Braille · spaced capital",
    lang: "en",
  },
];
