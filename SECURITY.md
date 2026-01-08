# Security Policy

## Overview

ARC Keepers is a client-side Progressive Web App (PWA) that runs entirely in your browser. There is no backend server — all data is stored locally in your browser's `localStorage`.

## Data Storage

- **Local Only:** All user data (keeplists, progress, settings) is stored in your browser's `localStorage`
- **No Accounts:** There are no user accounts, authentication, or server-side storage
- **No Tracking:** We do not collect any analytics, telemetry, or personal information
- **No Cookies:** The app does not use cookies for tracking purposes

## External Resources

The app loads the following external resources:

- **Item Images:** Loaded from `cdn.metaforge.app` (MetaForge CDN)
- **GitHub Corner:** Links to `github.com/arckeepers/arckeepers`

These are the only network requests made by the application.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email the maintainers directly or use GitHub's private vulnerability reporting feature
3. Provide a clear description of the vulnerability and steps to reproduce
4. Allow reasonable time for the issue to be addressed before public disclosure

## Security Best Practices for Users

- **Import/Export:** Only import JSON backup files that you created yourself or from trusted sources
- **Browser Security:** Keep your browser updated to the latest version
- **Extensions:** Be cautious of browser extensions that may access localStorage

## Dependencies

We regularly update dependencies to address security vulnerabilities. You can check for known vulnerabilities in our dependencies by running:

```bash
npm audit
```

## Scope

Since ARC Keepers is a client-side application with no backend:

- There are no server-side vulnerabilities
- There is no SQL injection, XSS to steal auth tokens, or CSRF concerns
- The main attack surface is malicious import files or compromised CDN resources

We take supply chain security seriously and monitor our dependencies for vulnerabilities.
