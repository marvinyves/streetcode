/**
 * Defensive fix for LLM output that runs multiple bullets onto one line
 * (e.g. "...senaste hot. - Oil jumped...") instead of separate lines, as
 * spec'd in the brief-generation prompt. Re-inserts a real newline before
 * each such inline bullet marker so every downstream consumer (web list,
 * plain-text WhatsApp message) can split it into real bullets reliably,
 * regardless of prompt compliance. Only matches " - " directly after a
 * sentence-ending period and before a capitalized word, so mid-sentence
 * dashes survive untouched.
 */
export function normalizeBulletText(text: string): string {
  return text.replace(/(?<=\.)\s+-\s+(?=[A-ZÅÄÖ])/g, "\n- ");
}
