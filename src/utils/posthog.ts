import posthog from "posthog-js";

// Initialize PostHog if API key is available
export function initPostHog() {
  const apiKey = "phc_KzYDUMqEHeRf8TI9fyRczlGFzN8ugBJ9Y5WMthfcUBM"; // Not a secret, VITE_PUBLIC_POSTHOG_KEY
  const host = "https://eu.i.posthog.com";

  if (!apiKey || !host) {
    console.warn("PostHog API key or host not configured");
    return;
  }

  posthog.init(apiKey, {
    api_host: host,
    // Only enable product analytics, not session replay or feature flags
    loaded: () => {
      if (import.meta.env.DEV) {
        console.log("PostHog initialized");
      }
    },
  });
}

// Export posthog instance for tracking events
export { posthog };
