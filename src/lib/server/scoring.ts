import { IOCs } from './ioc-extractor';

interface LeakData {
  source: string; // e.g., 'pastebin', 'github', 'hacking-forum'
  content: string;
  timestamp: Date;
  iocs: IOCs;
  watchlistMatches: string[]; // Domains or keywords that matched a user's watchlist
}

// Simple scoring schema based on user requirements
const SCORE_WEIGHTS = {
  SOURCE: {
    high: 30, // well-known breach DB, security researcher
    medium: 10, // forum
    low: 0, // unknown paste
  },
  CONTENT_TYPE: {
    credentials: 30, // emails with potential passwords, PII
    keys_or_configs: 40, // API keys, configs
    hashes_or_binaries: 20,
  },
  WATCHLIST_MATCH: {
    direct: 30,
    fuzzy: 15,
  },
  FRESHNESS: {
    under_24h: 10,
  },
  HAS_ARTIFACTS: 15, // Presence of screenshots, dumps etc. (hard to automate, can be manual flag)
};

// Keywords to detect content type
const CONTENT_KEYWORDS = {
  credentials: [/password/i, /pass/i, /creds/i, /credentials/i, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}:.+/i],
  keys_or_configs: [/api_key/i, /token/i, /secret/i, /config/i, /BEGIN (RSA|OPENSSH) PRIVATE KEY/],
};

export function calculateRiskScore(data: LeakData): number {
  let score = 0;

  // 1. Score based on source trust
  // This is a simplified mapping. A real system would have a configurable list.
  if (['security-researcher', 'breach-db'].includes(data.source)) {
    score += SCORE_WEIGHTS.SOURCE.high;
  } else if (['hacking-forum', 'github'].includes(data.source)) {
    score += SCORE_WEIGHTS.SOURCE.medium;
  } else {
    score += SCORE_WEIGHTS.SOURCE.low;
  }

  // 2. Score based on content type
  let contentTypeFound = false;
  if (CONTENT_KEYWORDS.keys_or_configs.some(regex => regex.test(data.content))) {
    score += SCORE_WEIGHTS.CONTENT_TYPE.keys_or_configs;
    contentTypeFound = true;
  }
  if (!contentTypeFound && CONTENT_KEYWORDS.credentials.some(regex => regex.test(data.content))) {
    score += SCORE_WEIGHTS.CONTENT_TYPE.credentials;
    contentTypeFound = true;
  }
  if (!contentTypeFound && (data.iocs.ips.length > 0 || data.iocs.urls.length > 0)) {
     // Generic fallback if specific keywords not found but IOCs exist
    score += SCORE_WEIGHTS.CONTENT_TYPE.hashes_or_binaries;
  }

  // 3. Score based on watchlist match
  if (data.watchlistMatches.length > 0) {
    // Assuming all matches are "direct" for now
    score += SCORE_WEIGHTS.WATCHLIST_MATCH.direct;
  }

  // 4. Score based on freshness
  const hoursSinceLeak = (new Date().getTime() - data.timestamp.getTime()) / (1000 * 60 * 60);
  if (hoursSinceLeak < 24) {
    score += SCORE_WEIGHTS.FRESHNESS.under_24h;
  }

  // 5. Score for artifacts (placeholder, as this is hard to automate)
  // For now, we can add a small bonus if there are multiple types of IOCs
  if (data.iocs.emails.length > 0 && data.iocs.ips.length > 0) {
      score += SCORE_WEIGHTS.HAS_ARTIFACTS;
  }

  return Math.min(score, 100); // Cap the score at 100
}