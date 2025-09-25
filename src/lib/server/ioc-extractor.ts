export interface IOCs {
  emails: string[];
  domains: string[];
  ips: string[];
  urls: string[];
}

// Regex to find email addresses
const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;

// Regex to find domain names (simplified)
const domainRegex = /([a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/gi;

// Regex to find IPv4 addresses
const ipRegex = /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;

// Regex to find URLs (including defanged ones)
const urlRegex = /(hxxps?|https?):\/\/[^\s/$.?#].[^\s]*/gi;

function extractMatches(text: string, regex: RegExp): string[] {
  const matches = text.match(regex);
  return matches ? [...new Set(matches)] : []; // Return unique matches
}

export function extractIOCs(content: string): IOCs {
  const emails = extractMatches(content, emailRegex);
  const ips = extractMatches(content, ipRegex);
  const urls = extractMatches(content, urlRegex);

  // Extract domains from emails and URLs to avoid duplicates, then add other found domains
  const domainsFromEmails = emails.map(email => email.split('@')[1]);
  const domainsFromUrls = urls.map(url => {
    try {
      // Handle defanged URLs for parsing
      const cleanUrl = url.replace(/^hxxp/i, 'http');
      return new URL(cleanUrl).hostname;
    } catch {
      return ''; // Invalid URL
    }
  }).filter(Boolean);

  const allDomains = extractMatches(content, domainRegex);

  const combinedDomains = [...new Set([...domainsFromEmails, ...domainsFromUrls, ...allDomains])];

  // Filter out common false positives from domains
  const falsePositiveDomains = ['github.com', 'pastebin.com', 'clone.net'];
  const finalDomains = combinedDomains.filter(domain => !falsePositiveDomains.includes(domain.toLowerCase()));

  return {
    emails,
    domains: finalDomains,
    ips,
    urls,
  };
}