/**
 * Display helpers for Resume Readiness Check
 * Fully theme-compliant and emoji-free (uses icon tokens).
 */

const MONTHS = 'Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?';

const DATE_RE = new RegExp(
  [
    // Month Year - Month Year (e.g., "Dec 2020 - Aug 2024", "January 2021 – Present", "06/2020 - 08/2024")
    String.raw`\(?(?:\b(?:${MONTHS})\b|\d{1,2}\/)?\s*\d{0,2}\s*,?\s*(?:19\d{2}|20\d{2})\s*[-–—to\s]+\s*(?:Present|Current|Ongoing|\b(?:${MONTHS})\b|\d{1,2}\/)?\s*\d{0,2}\s*,?\s*(?:19\d{2}|20\d{2}|\d{2})\)?`,
    // Year - Year (e.g., "2020 - 2024", "2018 - Present")
    String.raw`\(?(?:19\d{2}|20\d{2})\s*[-–—to\s]+\s*(?:Present|Current|Ongoing|19\d{2}|20\d{2}|\d{2})\)?`,
    // Month Year (e.g., "Dec 2020", "August 2024")
    String.raw`\(?\b(?:${MONTHS})\b\s+\d{0,2},?\s*(?:19\d{2}|20\d{2})\)?`,
    // Single parenthesized year or single year
    String.raw`\((?:19\d{2}|20\d{2})\)`,
    String.raw`\b(?:19\d{2}|20\d{2})\b`,
  ].join('|'),
  'gi',
);

const DEGREE_OR_ROLE_RE = /\b(bachelor|bachelors|master|masters|b\.?tech|b\.?e\.?|m\.?tech|m\.?e\.?|b\.?s\.?|b\.?sc|m\.?s\.?|m\.?sc|ph\.?d|diploma|intermediate|secondary|senior|tenth|10th|12th|class|degree|graduate|undergraduate|postgraduate|engineer|developer|intern|internship|manager|lead|architect|analyst|consultant|specialist|designer|scientist|associate|officer|coordinator)\b/i;

const URL_RE = /(https?:\/\/\S+|www\.\S+)/gi;
const HTML_TAG_RE = /<[^>]+>/g;
const LINK_LABEL_RE = /^(link|url|github|demo|live\s*demo|live\s*link|project\s*link|repo|repository)\s*:?\s*$/i;
const BULLET_PREFIX_RE = /^[-*•o🔹▪●○]\s*|^\d+[.)]\s*/;

export const SKILL_ACRONYMS = new Set([
  'sql', 'html', 'css', 'aws', 'gcp', 'api', 'rest', 'json', 'xml', 'ui',
  'ux', 'ai', 'ml', 'nlp', 'ci', 'cd', 'sdk', 'saas', 'php', 'seo', 'crm',
  'erp', 'oop', 'dbms', 'http', 'https', 'azure', 'sass',
]);

// Theme-harmonious category palette using CSS variables / semantic colors
export const CATEGORY_PALETTE = [
  { color: 'var(--color-primary, #059669)', bg: 'var(--color-primary-light, #ecfdf5)' },
  { color: 'var(--color-secondary, #0d9488)', bg: 'var(--color-secondary-light, #ccfbf1)' },
  { color: 'var(--color-accent, #0284c7)', bg: 'var(--color-accent-light, #e0f2fe)' },
  { color: 'var(--color-warning, #d97706)', bg: 'var(--color-warning-light, #fef3c7)' },
  { color: 'var(--color-success, #16a34a)', bg: 'var(--color-success-light, #dcfce7)' },
  { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
  { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)' },
  { color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)' },
];

export function displaySkillName(skill) {
  const s = (skill || '').trim();
  if (!s) return '';
  if (SKILL_ACRONYMS.has(s.toLowerCase())) return s.toUpperCase();
  if (/[A-Z]/.test(s)) return s;
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function cleanResumeLine(line, stripLinks = true) {
  let t = line.replace(HTML_TAG_RE, '').replace(/\s+/g, ' ').trim();
  if (!t) return '';
  if (stripLinks) {
    const stripped = t.replace(/[-–—:|]/g, '').trim();
    if (LINK_LABEL_RE.test(stripped)) return '';
    t = t.replace(URL_RE, '').trim().replace(/[-–—:|]+$/, '').trim();
    if (!t || LINK_LABEL_RE.test(t.replace(/[-–—:|]/g, '').trim())) return '';
  }
  return t;
}

export function highlightDates(text) {
  const parts = [];
  let lastIndex = 0;
  const re = new RegExp(DATE_RE.source, DATE_RE.flags);
  let m = re.exec(text);
  while (m !== null) {
    if (m.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, m.index) });
    }
    parts.push({ type: 'date', value: m[0].replace(/[()]/g, '').trim() });
    lastIndex = re.lastIndex;
    m = re.exec(text);
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return parts.length ? parts : [{ type: 'text', value: text }];
}

/** Parses structured section rows */
export function parseStructuredSection(content, stripLinks = true) {
  if (!content || /not clearly detected/i.test(content)) {
    return { empty: true, rows: [] };
  }

  const rows = [];
  for (const rawLine of content.split('\n')) {
    const stripped = rawLine.trim();
    if (!stripped) continue;

    const isBullet = BULLET_PREFIX_RE.test(stripped);
    const line = cleanResumeLine(stripped.replace(BULLET_PREFIX_RE, ''), stripLinks);
    if (!line) continue;

    if (isBullet) {
      rows.push({ type: 'bullet', text: line });
    } else {
      const hasDateMatch = new RegExp(DATE_RE.source, DATE_RE.flags).test(line);
      const isHeadingLike = DEGREE_OR_ROLE_RE.test(line) || line.length <= 110;
      if (hasDateMatch || isHeadingLike) {
        rows.push({ type: 'heading', text: line });
      } else {
        rows.push({ type: 'body', text: line });
      }
    }
  }

  return { empty: rows.length === 0, rows };
}

/** Mirrors calculate_job_match_breakdown from resume_engine.py */
export function calculateJobMatchBreakdown(result) {
  if (!result) return null;
  const breakdown = {
    skills: Math.round(((result.skills_score || 0) * 35) / 100 * 10) / 10,
    experience: Math.round(((result.experience_score || 0) * 20) / 100 * 10) / 10,
    education: Math.round(((result.education_score || 0) * 10) / 100 * 10) / 10,
    semantic: Math.round(((result.semantic_similarity?.score || 0) * 20) / 100 * 10) / 10,
    project_quality: Math.round(((result.project_analysis?.score || 0) * 15) / 100 * 10) / 10,
  };
  breakdown.total = Math.round(
    (breakdown.skills + breakdown.experience + breakdown.education
      + breakdown.semantic + breakdown.project_quality) * 10,
  ) / 10;
  return breakdown;
}
