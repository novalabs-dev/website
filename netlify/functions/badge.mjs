// SVG badge generator for ContextKit CLAUDE.md scores
// Usage: /api/badge?score=7.5&label=Good

const ALLOWED_LABELS = ['Minimal', 'Needs work', 'Decent', 'Good', 'Excellent'];

function getColor(score) {
  if (score >= 9) return '#22c55e';   // green
  if (score >= 7) return '#10b981';   // emerald
  if (score >= 5) return '#f59e0b';   // amber
  if (score >= 3) return '#f97316';   // orange
  return '#ef4444';                    // red
}

function generateSvg(score, label) {
  const leftText = 'CLAUDE.md';
  const rightText = `${score}/10 ${label}`;
  const color = getColor(score);

  // Calculate widths (approximate: 7px per char for Verdana 11px, +20px padding)
  const leftWidth = Math.round(leftText.length * 7) + 20;
  const rightWidth = Math.round(rightText.length * 7) + 20;
  const totalWidth = leftWidth + rightWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${leftText}: ${rightText}">
  <title>${leftText}: ${rightText}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${leftWidth}" height="20" fill="#555"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text aria-hidden="true" x="${leftWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${leftText}</text>
    <text x="${leftWidth / 2}" y="14">${leftText}</text>
    <text aria-hidden="true" x="${leftWidth + rightWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${rightText}</text>
    <text x="${leftWidth + rightWidth / 2}" y="14">${rightText}</text>
  </g>
</svg>`;
}

export default async (req) => {
  const url = new URL(req.url);
  const scoreParam = url.searchParams.get('score');
  const labelParam = url.searchParams.get('label');

  // Validate score
  const score = parseFloat(scoreParam);
  if (isNaN(score) || score < 0 || score > 10) {
    return new Response('Invalid score parameter (0-10)', { status: 400 });
  }
  const roundedScore = Math.round(score * 10) / 10;

  // Validate label
  if (!labelParam || !ALLOWED_LABELS.includes(labelParam)) {
    return new Response(`Invalid label. Allowed: ${ALLOWED_LABELS.join(', ')}`, { status: 400 });
  }

  const svg = generateSvg(roundedScore, labelParam);

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

export const config = {
  path: '/api/badge',
};
