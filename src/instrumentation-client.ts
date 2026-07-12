import posthog from "posthog-js";

const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

if (posthogToken) {
  posthog.init(posthogToken, {
    api_host: posthogHost,
    capture_pageleave: true,
    capture_pageview: true,
    defaults: "2026-05-30",
    person_profiles: "identified_only",
  });
}
